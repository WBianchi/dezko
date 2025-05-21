import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

// Inicializar o Stripe com sua chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
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

    // Extrair dados do corpo da requisição
    const {
      planoId,
      paymentMethodId,
      tipoAssinatura,
      cardName
    } = await req.json();

    if (!planoId || !paymentMethodId || !tipoAssinatura) {
      return NextResponse.json(
        { error: "Dados incompletos para criar assinatura" },
        { status: 400 }
      );
    }

    // Buscar dados do plano
    const plano = await prisma.plano.findUnique({
      where: { id: planoId },
    });

    if (!plano) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é um espaço
    // @ts-ignore - campos existem no banco mas não nos tipos
    if (session.user?.role !== 'espaco') {
      return NextResponse.json(
        { error: "Apenas espaços podem assinar planos" },
        { status: 403 }
      );
    }

    // @ts-ignore - campos existem no banco mas não nos tipos
    const espacoId = session.user.espacoId;
    
    // Buscar o espaço para verificar se já tem uma assinatura ativa
    const espaco = await prisma.espaco.findUnique({
      where: { id: espacoId },
      include: {
        assinaturas: {
          where: {
            status: "ATIVA",
          },
        },
      },
    });

    if (!espaco) {
      return NextResponse.json(
        { error: "Espaço não encontrado" },
        { status: 404 }
      );
    }

    // Se já existe uma assinatura ativa, verificar se precisamos cancelar
    if (espaco.assinaturas.length > 0) {
      const assinaturaAtiva = espaco.assinaturas[0];
      
      // Se tem um ID de assinatura Stripe, cancelar a assinatura no Stripe
      // @ts-ignore - o campo existe no schema do Prisma mas pode não estar nos tipos gerados
      if (assinaturaAtiva.stripeSubscriptionId) {
        try {
          // @ts-ignore - o campo existe no schema do Prisma mas pode não estar nos tipos gerados
          await stripe.subscriptions.cancel(assinaturaAtiva.stripeSubscriptionId);
        } catch (error) {
          console.error("Erro ao cancelar assinatura existente no Stripe:", error);
        }
      }
      
      // Atualizar status da assinatura no banco
      await prisma.assinatura.update({
        where: { id: assinaturaAtiva.id },
        data: { status: "CANCELADA" },
      });
    }

    // Determinar o valor e detalhes da assinatura
    // @ts-ignore - usando campos que podem não estar nos tipos gerados mas existem no banco
    const valor = tipoAssinatura === 'mensal' ? (plano.valorMensal || plano.preco) : (plano.valorAnual || plano.preco * 12 * 0.85);
    const intervalo = tipoAssinatura === 'mensal' ? 'month' : 'year';
    const dataInicio = new Date();
    const dataExpiracao = new Date();
    
    if (tipoAssinatura === 'mensal') {
      dataExpiracao.setMonth(dataInicio.getMonth() + 1);
    } else {
      dataExpiracao.setFullYear(dataInicio.getFullYear() + 1);
    }

    // Criar ou recuperar cliente no Stripe
    let customer;
    
    // Verificar se o espaço já tem um customerID no Stripe
    // @ts-ignore - o campo existe no schema do Prisma mas pode não estar nos tipos gerados
    if (espaco.assinaturas.length > 0 && espaco.assinaturas[0].stripeCustomerId) {
      // @ts-ignore - o campo existe no schema do Prisma mas pode não estar nos tipos gerados
      customer = await stripe.customers.retrieve(espaco.assinaturas[0].stripeCustomerId);
    } else {
      // Criar novo cliente no Stripe
      customer = await stripe.customers.create({
        email: espaco.email,
        name: espaco.nome,
        metadata: {
          espacoId: espacoId
        }
      });
    }

    // Anexar método de pagamento ao cliente
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });
    
    // Definir como método de pagamento padrão
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Criar produto no Stripe (se não existir)
    const productName = `Plano ${plano.nome}`;
    let product = await getOrCreateProduct(productName, plano.id);

    // Criar preço no Stripe
    const priceId = await getOrCreatePrice(
      product.id, 
      Math.round(valor * 100), 
      intervalo,
      tipoAssinatura
    );

    // Criar assinatura no Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        espacoId: espacoId,
        planoId: planoId,
        tipoAssinatura: tipoAssinatura
      }
    });

    // @ts-ignore - acessando propriedades expandidas
    const clientSecret = subscription.latest_invoice.payment_intent?.client_secret;

    // Criar nova assinatura no banco de dados
    // @ts-ignore - os campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
    const novaAssinatura = await prisma.assinatura.create({
      data: {
        dataInicio,
        dataExpiracao,
        valor,
        status: "ATIVA",
        espacoId,
        planoId,
        // @ts-ignore - os campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripeSubscriptionId: subscription.id,
        // @ts-ignore - os campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripeCustomerId: customer.id,
        // @ts-ignore - os campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripePriceId: priceId,
        // @ts-ignore - os campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripePaymentMethodId: paymentMethodId,
        formaPagamento: "CARTAO"
      },
    });

    return NextResponse.json({
      success: true,
      assinaturaId: novaAssinatura.id,
      clientSecret,
      requiresAction: clientSecret ? true : false,
      subscription: subscription.id
    });
  } catch (error) {
    console.error("Erro ao criar assinatura:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar assinatura" },
      { status: 500 }
    );
  }
}

// Função auxiliar para obter ou criar produto no Stripe
async function getOrCreateProduct(name: string, planoId: string) {
  // Buscar produtos existentes
  const products = await stripe.products.list({
    limit: 100,
  });
  
  // Procurar um produto com o mesmo nome
  const existingProduct = products.data.find(
    (p) => p.name === name && p.metadata.planoId === planoId
  );
  
  if (existingProduct) {
    return existingProduct;
  }
  
  // Criar novo produto
  return await stripe.products.create({
    name,
    metadata: {
      planoId
    }
  });
}

// Função auxiliar para obter ou criar preço no Stripe
async function getOrCreatePrice(productId: string, amount: number, interval: 'month' | 'year', tipoAssinatura: string) {
  // Buscar preços existentes para este produto
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
  });
  
  // Procurar preço compatível
  const existingPrice = prices.data.find(
    (p) => 
      p.unit_amount === amount && 
      p.recurring?.interval === interval &&
      p.metadata.tipoAssinatura === tipoAssinatura
  );
  
  if (existingPrice) {
    return existingPrice.id;
  }
  
  // Criar novo preço
  const newPrice = await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency: 'brl',
    recurring: {
      interval: interval
    },
    metadata: {
      tipoAssinatura
    }
  });
  
  return newPrice.id;
}
