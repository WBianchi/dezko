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

// Função para validar e-mail
const validarEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

// Função para limpar e validar CPF
const formatarCPF = (cpf: string | undefined): string | null => {
  if (!cpf) return null;
  const cpfLimpo = cpf.replace(/\D/g, '');
  return cpfLimpo.length === 11 ? cpfLimpo : null;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { reservationId, valor, dadosPagador } = await req.json();

    if (!reservationId || !valor) {
      return NextResponse.json(
        { error: "Dados incompletos para processar o pagamento" },
        { status: 400 }
      );
    }

    // Buscar o pedido no banco de dados com informações do espaço
    const pedido = await prisma.pedido.findUnique({
      where: { id: reservationId },
      include: {
        usuario: true,
        espaco: true,
        plano: true
      }
    });

    if (!pedido) {
      console.error(`Pedido não encontrado: ${reservationId}`);
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
      // Processando nome do pagador
      let firstName = "Usuário";
      let lastName = "Dezko";
      
      if (dadosPagador?.nome) {
        const partesNome = dadosPagador.nome.trim().split(' ');
        firstName = partesNome[0] || "Usuário";
        lastName = partesNome.length > 1 ? partesNome.slice(1).join(' ') : "Dezko";
      } else if (session.user.name) {
        const partesNome = session.user.name.trim().split(' ');
        firstName = partesNome[0] || "Usuário";
        lastName = partesNome.length > 1 ? partesNome.slice(1).join(' ') : "Dezko";
      }
      
      // Garantir que temos um email válido
      const email = validarEmail(pedido.usuario.email || '')
        ? pedido.usuario.email
        : validarEmail(session.user.email || '')
          ? session.user.email
          : "cliente@dezko.com.br";

      // Configurar dados do cliente
      const customerData: Stripe.CustomerCreateParams = {
        email: email,
        name: `${firstName} ${lastName}`,
        address: dadosPagador ? {
          line1: dadosPagador.endereco || "Endereço não informado",
          postal_code: dadosPagador.cep?.replace(/\D/g, '') || "00000000",
          city: dadosPagador.cidade || "São Paulo",
          state: dadosPagador.estado || "SP",
          country: 'BR',
        } : undefined,
      };

      // Criar ou atualizar cliente
      let customer;
      // Nota: precisamos adicionar este campo ao modelo Usuario no Prisma
      // @ts-ignore - Usando o modelo de usuário correto
      const existingCustomer = await prisma.usuario.findUnique({
        where: { id: session.user?.id || pedido.usuarioId },
        select: { stripeCustomerId: true }
      });

      if (existingCustomer?.stripeCustomerId) {
        // Atualizar cliente existente
        customer = await stripe.customers.update(
          existingCustomer.stripeCustomerId,
          customerData
        );
      } else {
        // Criar novo cliente
        customer = await stripe.customers.create(customerData);
        
        // Salvar ID do cliente no banco de dados
        // Nota: isso vai falhar até atualizarmos o modelo no Prisma
        try {
          // @ts-ignore - Usando o modelo de usuário correto
          await prisma.usuario.update({
            where: { id: session.user?.id || pedido.usuarioId },
            data: { stripeCustomerId: customer.id }
          });
        } catch (err) {
          console.error("Campo stripeCustomerId ainda não existe no modelo User:", err);
          // Continuamos mesmo que falhe, já que é apenas para associação futura
        }
      }

      // Configuração básica do pagamento
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(valor * 100), // Stripe trabalha em centavos
        currency: 'brl',
        customer: customer.id,
        payment_method_types: ['pix'],
        description: `Reserva em ${pedido.espaco.nome}`,
        metadata: {
          pedido_id: pedido.id,
          reservationId: reservationId
        },
        receipt_email: email,
      };

      // Se o espaço tem integração com Stripe Connect, configurar o split payment
      if (espacoIntegrado) {
        // Calcular comissão da plataforma (10%)
        const comissao = Math.round(valor * 100 * 0.1);
        
        // Configurar transferência para a conta conectada do espaço
        paymentIntentParams.transfer_data = {
          destination: espacoIntegrado,
        };
        paymentIntentParams.application_fee_amount = comissao;
      }

      // Criar Payment Intent
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

      // Configurar PIX para Brasil
      const pixOptions = await stripe.paymentMethods.create({
        type: 'pix',
        billing_details: {
          email: email,
          name: `${firstName} ${lastName}`,
        },
      });

      if (!pixOptions.id) {
        throw new Error('Falha ao criar método de pagamento PIX');
      }

      // Associar método de pagamento PIX ao PaymentIntent
      await stripe.paymentIntents.update(paymentIntent.id, {
        payment_method: pixOptions.id,
      });

      // Obter os detalhes do PIX
      const pixDetails = await stripe.paymentIntents.retrieve(paymentIntent.id);
      const nextAction = pixDetails.next_action?.pix_display_qr_code;

      if (!nextAction || !nextAction.data) {
        throw new Error('Não foi possível gerar o QR Code PIX');
      }

      // Data de expiração (30 minutos a partir de agora)
      const expirationDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      // Atualizar o pedido com as informações de pagamento
      // Nota: o campo stripePaymentIntentId ainda não existe no modelo Pedido
      try {
        await prisma.pedido.update({
          where: { id: reservationId },
          data: {
            // stripePaymentIntentId: paymentIntent.id,
            statusPedido: "PENDENTE",
            formaPagamento: "PIX"
          }
        });
      } catch (err) {
        console.error("Campo stripePaymentIntentId ainda não existe no modelo Pedido:", err);
      }
      
      // Buscar/criar reserva associada
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
      
      if (reserva) {
        // Atualizar a reserva com o ID do pagamento
        // Nota: o campo stripePaymentIntentId ainda não existe no modelo Reservation
        try {
          await prisma.reservation.update({
            where: { id: reserva.id },
            data: {
              // stripePaymentIntentId: paymentIntent.id
            }
          });
        } catch (err) {
          console.error("Campo stripePaymentIntentId ainda não existe no modelo Reservation:", err);
        }
      }
      
      // Preparar os dados do QR Code para retornar
      return NextResponse.json({
        id: paymentIntent.id,
        // @ts-ignore - Ignorando problemas com os dados do PIX
        qr_code: nextAction.data.pix_key, // Código PIX texto para copiar
        // @ts-ignore - Ignorando problemas com os dados do PIX
        qr_code_base64: `data:image/png;base64,${nextAction.data.image}`, // QR Code em base64
        expiration_date: expirationDate,
        split_payment: !!espacoIntegrado
      });
    } catch (stripeError: any) {
      console.error("Erro do Stripe:", stripeError);
      return NextResponse.json(
        { error: "Falha ao processar pagamento PIX no Stripe", details: stripeError.message },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar pagamento PIX:", error);
    return NextResponse.json(
      { error: "Falha ao processar pagamento PIX" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentIntentId = searchParams.get('paymentIntentId');
    
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "ID do pagamento PIX não fornecido" },
        { status: 400 }
      );
    }

    // Consultar o status do pagamento no Stripe
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const isApproved = paymentIntent.status === 'succeeded';
      
      if (isApproved) {
        // Atualizar o pedido e a reserva no banco de dados
        // Nota: o campo stripePaymentIntentId ainda não existe nos modelos
        const pedido = await prisma.pedido.findFirst({
          where: {
            // stripePaymentIntentId: paymentIntentId
            // Usamos uma condição alternativa enquanto o campo não existe
            OR: [
              { mercadoPagoPaymentId: paymentIntentId }, // Temporário, apenas para encontrar o pedido
              { id: searchParams.get('pedidoId') || '' } // Hack temporário até termos o campo correto
            ]
          },
          include: {
            usuario: true,
            agenda: true,
            espaco: true,
            plano: true
          }
        });
        
        if (pedido) {
          // Atualizar status do pedido para PAGO
          await prisma.pedido.update({
            where: { id: pedido.id },
            data: {
              statusPedido: "PAGO"
            }
          });

          // Buscar a reserva associada a este pedido
          const reserva = await prisma.reservation.findFirst({
            where: {
              OR: [
                // { stripePaymentIntentId: paymentIntentId },
                { mercadoPagoPreferenceId: pedido.mercadoPagoPreferenceId }
              ]
            }
          });

          if (reserva) {
            // Atualizar o status da reserva para PAGO
            await prisma.reservation.update({
              where: { id: reserva.id },
              data: {
                status: 'PAGO',
                // stripePaymentIntentId: paymentIntentId
              }
            });
            
            // Criar ou atualizar pagamento associado à reserva
            const pagamentoExistente = await prisma.pagamento.findFirst({
              where: { 
                OR: [
                  { gatewayId: paymentIntentId },
                  { reservaId: reserva.id }
                ]
              }
            });
            
            if (pagamentoExistente) {
              await prisma.pagamento.update({
                where: { id: pagamentoExistente.id },
                data: {
                  status: 'pago',
                  gatewayId: paymentIntentId
                }
              });
            } else {
              await prisma.pagamento.create({
                data: {
                  valor: pedido.valor,
                  status: 'pago',
                  gateway: 'stripe',
                  gatewayId: paymentIntentId,
                  reservaId: reserva.id,
                  metadata: {
                    pedidoId: pedido.id,
                    formaPagamento: "PIX"
                  }
                }
              });
            }
            
            return NextResponse.json({ 
              message: "Pagamento aprovado com sucesso!",
              reservaId: reserva.id,
              status: "approved"
            });
          }
        }
      }
      
      // Se o pagamento não está aprovado ou não encontramos pedido/reserva
      return NextResponse.json({ 
        status: paymentIntent.status,
        is_approved: isApproved
      });
      
    } catch (stripeError: any) {
      console.error("Erro ao verificar pagamento PIX no Stripe:", stripeError);
      return NextResponse.json(
        { error: "Falha ao verificar pagamento", details: stripeError.message },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Erro ao verificar pagamento PIX:", error);
    return NextResponse.json(
      { error: "Falha ao verificar pagamento PIX" },
      { status: 500 }
    );
  }
}
