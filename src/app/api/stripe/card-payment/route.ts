import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

// Inicializar o Stripe com sua chave secreta
// @ts-ignore - Ignorando problemas de versão da API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any, // Use a versão mais recente disponível
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const {
      reservationId,
      transactionAmount,
      paymentMethodId,  // Agora recebemos o ID do método de pagamento
      installments,
      dadosPagador,
    } = await req.json();

    if (!reservationId || !transactionAmount || !paymentMethodId) {
      return NextResponse.json(
        { error: "Dados incompletos para processar o pagamento" },
        { status: 400 }
      );
    }

    // Buscar o pedido no banco de dados
    const pedido = await prisma.pedido.findUnique({
      where: { id: reservationId },
      include: {
        usuario: true,
        agenda: true,
        espaco: true,
        plano: true
      }
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se o espaço tem integração com Stripe
    // Nota: precisamos adicionar este campo ao modelo Espaco no Prisma
    // @ts-ignore - Ignorando o campo que ainda não foi adicionado ao modelo
    const espacoIntegrado = pedido.espaco.stripeConnectAccountId; 
    
    try {
      // Usamos o PaymentMethod criado pelo cliente
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      // Configurar dados do cliente/pagador com abordagem simplificada
      const customerData: Stripe.CustomerCreateParams = {
        email: dadosPagador?.email || pedido.usuario.email || session.user?.email || '',
        name: dadosPagador?.nome || session.user?.name || '',
        // Não requerir campos de endereço que não estão no formulário simplificado
      };

      // Criar ou atualizar cliente
      let customer;
      
      // Buscar usuário para verificar se já tem um stripeCustomerId 
      // @ts-ignore - Campo existe no banco mas não está refletido nos tipos
      const usuario = await prisma.usuario.findUnique({
        where: { id: session.user?.id || pedido.usuarioId },
        select: { id: true, email: true }
      });
      
      // Buscar o stripeCustomerId diretamente do banco para evitar problemas de tipagem
      const usuarioStripe = await prisma.$queryRaw<{stripeCustomerId?: string}[]>`
        SELECT "stripeCustomerId" FROM "Usuario" WHERE id = ${session.user?.id || pedido.usuarioId} LIMIT 1
      `;
      
      const stripeCustomerId = usuarioStripe?.[0]?.stripeCustomerId;
      
      // Verificar se existe um stripeCustomerId
      if (stripeCustomerId) {
        // Atualizar cliente existente
        try {
          customer = await stripe.customers.update(
            stripeCustomerId,
            customerData
          );
        } catch (err) {
          console.error('Erro ao atualizar cliente do Stripe, criando novo:', err);
          customer = await stripe.customers.create(customerData);
          
          // Atualizar o ID do cliente no banco de dados
          // @ts-ignore - Campo existe no banco mas não está refletido nos tipos
          await prisma.usuario.update({
            where: { id: session.user?.id || pedido.usuarioId },
            data: { stripeCustomerId: customer.id }
          });
        }
      } else {
        // Criar novo cliente
        customer = await stripe.customers.create(customerData);
        
        // Salvar ID do cliente no banco de dados
        // @ts-ignore - Campo existe no banco mas não está refletido nos tipos
        await prisma.usuario.update({
          where: { id: session.user?.id || pedido.usuarioId },
          data: { stripeCustomerId: customer.id }
        });
      }

      // Configuração básica do pagamento
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(transactionAmount * 100), // Stripe trabalha em centavos
        currency: 'brl',
        customer: customer.id,
        payment_method_types: ['card'],
        description: `Reserva em ${pedido.espaco.nome}`,
        metadata: {
          pedido_id: pedido.id,
          reservationId: reservationId,
          installments: installments || 1
        },
        receipt_email: pedido.usuario.email || session.user?.email || undefined,
      };

      // Buscar configurações globais de split
      const configSplit = await prisma.$queryRaw<any[]>`
        SELECT * FROM "ConfigSplit" WHERE type = 'global' LIMIT 1
      `;
      const globalConfig = configSplit?.[0] || null;
      
      // Verificar se o Stripe está habilitado para split nas configurações globais
      if (globalConfig && globalConfig.stripeEnabled && espacoIntegrado) {
        console.log('Configurando split para Stripe com conta conectada:', espacoIntegrado);
        
        // Buscar configuração específica para este espaço
        const spaceCommission = await prisma.$queryRaw<any[]>`
          SELECT * FROM "SpaceCommission" WHERE "spaceId" = ${pedido.espacoId} LIMIT 1
        `;
        
        // Buscar configuração específica para o plano usado
        let planCommission = null;
        if (pedido.planoId) {
          planCommission = await prisma.$queryRaw<any[]>`
            SELECT * FROM "PlanCommission" WHERE "planId" = ${pedido.planoId} LIMIT 1
          `;
        }
        
        // Determinar qual comissão usar (espaço > plano > global, nessa ordem de prioridade)
        let comissaoType = globalConfig.commissionType;
        let comissaoValue = globalConfig.stripeCommissionRate || globalConfig.commissionValue;
        let comissaoSource = 'global';
        
        // Se houver comissão específica para este espaço, usar essa
        if (spaceCommission && spaceCommission.length > 0) {
          if ('commissionType' in spaceCommission[0] && 'commissionValue' in spaceCommission[0]) {
            comissaoType = spaceCommission[0].commissionType;
            comissaoValue = spaceCommission[0].commissionValue;
            comissaoSource = 'espaço';
          }
        } 
        // Se não tiver comissão do espaço mas tiver ativado comissão por plano e existir uma
        else if (globalConfig.enablePlanCommission && planCommission && planCommission.length > 0) {
          if ('commissionType' in planCommission[0] && 'commissionValue' in planCommission[0]) {
            comissaoType = planCommission[0].commissionType;
            comissaoValue = planCommission[0].commissionValue;
            comissaoSource = 'plano';
          }
        }
        
        console.log(`Usando comissão do tipo ${comissaoSource}: ${comissaoType} de valor ${comissaoValue}`);
        
        // Calcular valor da comissão baseado no tipo (percentual, fixo, ou baseado em plano)
        let comissao = 0;
        const valorTotal = Math.round(transactionAmount * 100); // Valor total em centavos
        
        if (comissaoType === 'percentage') {
          // Se for percentual, calcular com base no valor total
          comissao = Math.round(valorTotal * (comissaoValue / 100));
          console.log(`Comissão percentual de ${comissaoValue}% = ${comissao} centavos`);
        } else if (comissaoType === 'fixed') {
          // Se for valor fixo, converter para centavos
          comissao = Math.round(comissaoValue * 100);
          console.log(`Comissão fixa de ${comissao} centavos`);
        } else if (comissaoType === 'plan' && pedido.plano) {
          // Se for baseado no plano, usar o valor do plano como base
          comissao = Math.round(pedido.plano.preco * 100);
          console.log(`Comissão baseada no plano: ${comissao} centavos`);
        }
        
        // Configurar transferência para a conta conectada do espaço
        paymentIntentParams.transfer_data = {
          destination: espacoIntegrado,
        };
        paymentIntentParams.application_fee_amount = comissao;
        
        console.log(`Split configurado: ${valorTotal - comissao} centavos para o espaço, ${comissao} centavos para o admin`);
      } else if (espacoIntegrado) {
        // Configuração padrão se não tiver configuração específica
        // Calcular comissão da plataforma (10%)
        const comissao = Math.round(transactionAmount * 100 * 0.1);
        
        // Configurar transferência para a conta conectada do espaço
        paymentIntentParams.transfer_data = {
          destination: espacoIntegrado,
        };
        paymentIntentParams.application_fee_amount = comissao;
        
        console.log('Usando configuração padrão de split (10%) para o Stripe');
      }

      // Adicionar o payment method aos parâmetros do PaymentIntent
      paymentIntentParams.payment_method = paymentMethodId;
      paymentIntentParams.confirm = true; // Confirmar imediatamente
      
      // Criar e confirmar Payment Intent em um único passo
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

      // Verificar status do pagamento
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Pagamento não autorizado: ${paymentIntent.status}`);
      }

      // Atualizar o pedido com as informações de pagamento
      // Nota: o campo stripePaymentIntentId ainda não existe no modelo Pedido
      try {
        await prisma.pedido.update({
          where: { id: reservationId },
          data: {
            // stripePaymentIntentId: paymentIntent.id,
            statusPedido: "PAGO",
            formaPagamento: "CARTAO"
          }
        });
      } catch (err) {
        console.error("Campo stripePaymentIntentId ainda não existe no modelo Pedido:", err);
      }

      // Buscar a reserva correspondente que já deve existir com status PENDENTE
      const reserva = await prisma.reservation.findFirst({
        where: {
          OR: [
            { mercadoPagoPreferenceId: pedido.mercadoPagoPreferenceId || undefined },
            { 
              agendaId: pedido.agendaId || undefined, 
              espacoId: pedido.espacoId, 
              userId: pedido.usuarioId || undefined 
            }
          ]
        }
      });

      if (!reserva) {
        return NextResponse.json(
          { error: "Reserva associada não encontrada" },
          { status: 404 }
        );
      }

      // Atualizar a reserva existente para PAGO
      // Nota: o campo stripePaymentIntentId ainda não existe no modelo Reservation
      try {
        await prisma.reservation.update({
          where: { id: reserva.id },
          data: {
            status: 'PAGO',
            // stripePaymentIntentId: paymentIntent.id
          }
        });
      } catch (err) {
        console.error("Campo stripePaymentIntentId ainda não existe no modelo Reservation:", err);
      }

      // Criar um pagamento associado à reserva
      const novoPagamento = await prisma.pagamento.create({
        data: {
          valor: pedido.valor,
          status: 'pago', 
          gateway: 'stripe',
          gatewayId: paymentIntent.id,
          reservaId: reserva.id,
          metadata: {
            pedidoId: pedido.id,
            formaPagamento: "CARTAO",
            espacoIntegrado: !!espacoIntegrado,
            comissaoPlataforma: espacoIntegrado ? (pedido.valor * 0.1) : 0,
            valorLiquido: espacoIntegrado ? (pedido.valor * 0.9) : pedido.valor,
            cardDetails: {
              // Usando o last4 do payment method recuperado
              last4: paymentMethod.card?.last4 || '****',
              // Usando a marca do cartão do payment method
              brand: paymentMethod.card?.brand || 'unknown',
              installments: installments || 1
            }
          }
        }
      });

      console.log(`Pagamento criado com sucesso: ${novoPagamento.id}`);

      // Criar resultado para retornar ao cliente
      const paymentResult = {
        id: paymentIntent.id,
        status: "approved",
        detail: "Pagamento aprovado com sucesso",
        date_approved: new Date().toISOString(),
        payment_method_id: "card",
        installments: installments || 1,
        transaction_amount: transactionAmount,
        reservation_id: reserva.id,
        payment_id: novoPagamento.id,
        split_payment: !!espacoIntegrado
      };

      return NextResponse.json(paymentResult);
    } catch (stripeError: any) {
      console.error("Erro do Stripe:", stripeError);
      return NextResponse.json(
        { error: "Falha ao processar pagamento no Stripe", details: stripeError.message },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    return NextResponse.json(
      { error: "Falha ao processar pagamento" },
      { status: 500 }
    );
  }
}
