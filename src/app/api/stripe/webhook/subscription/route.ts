import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { buffer } from 'micro';

// Inicializar o Stripe com sua chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

// Desabilitar o parser de corpo padrão do Next.js para webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Obter o corpo da requisição como buffer
    const chunks = [];
    for await (const chunk of req.body as any) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const rawBody = Buffer.concat(chunks).toString('utf8');
    
    // Verificar assinatura do webhook
    const signature = req.headers.get("stripe-signature") || "";
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SUBSCRIPTION_SECRET || ""
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Processar eventos
    switch (event.type) {
      // Quando uma assinatura é criada com sucesso
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      // Quando uma assinatura é atualizada
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      // Quando uma assinatura é cancelada
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // Quando uma fatura é paga (renovação de assinatura)
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      // Quando uma fatura falha
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Manipuladores de eventos

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const espacoId = subscription.metadata.espacoId;
  const planoId = subscription.metadata.planoId;
  
  if (!espacoId || !planoId) {
    console.log("Assinatura sem metadata necessária");
    return;
  }
  
  try {
    // Verificar se a assinatura já existe no banco
    // @ts-ignore - o campo existe no schema do Prisma mas pode não estar nos tipos gerados
    const assinaturaExistente = await prisma.assinatura.findFirst({
      where: {
        // @ts-ignore - o campo existe no schema do Prisma mas pode não estar nos tipos gerados
        stripeSubscriptionId: subscription.id,
      },
    });
    
    if (assinaturaExistente) {
      console.log(`Assinatura ${subscription.id} já existe no banco`);
      return;
    }
    
    // Calcular datas
    const dataInicio = new Date(subscription.current_period_start * 1000);
    const dataExpiracao = new Date(subscription.current_period_end * 1000);
    
    // Criar nova assinatura
    // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
    await prisma.assinatura.create({
      data: {
        dataInicio,
        dataExpiracao,
        valor: (subscription.items.data[0].price.unit_amount || 0) / 100,
        status: "ATIVA",
        espacoId,
        planoId,
        // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripeSubscriptionId: subscription.id,
        // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripeCustomerId: subscription.customer as string,
        // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripePriceId: subscription.items.data[0].price.id,
        formaPagamento: "CARTAO"
      },
    });
    
    console.log(`Nova assinatura ${subscription.id} criada`);
  } catch (error) {
    console.error("Erro ao processar assinatura criada:", error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Encontrar assinatura no banco
    // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
    const assinatura = await prisma.assinatura.findFirst({
      where: {
        // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripeSubscriptionId: subscription.id,
      },
    });
    
    if (!assinatura) {
      console.log(`Assinatura ${subscription.id} não encontrada no banco`);
      return;
    }
    
    // Mapear status do Stripe para nosso status
    let status = "ATIVA";
    if (subscription.status === "canceled" || subscription.status === "unpaid") {
      status = "CANCELADA";
    } else if (subscription.status === "past_due") {
      status = "PENDENTE";
    }
    
    // Atualizar assinatura
    await prisma.assinatura.update({
      where: { id: assinatura.id },
      data: {
        status,
        dataExpiracao: new Date(subscription.current_period_end * 1000),
        // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripePriceId: subscription.items.data[0].price.id,
        valor: (subscription.items.data[0].price.unit_amount || 0) / 100,
      },
    });
    
    console.log(`Assinatura ${subscription.id} atualizada`);
  } catch (error) {
    console.error("Erro ao processar atualização de assinatura:", error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Encontrar assinatura no banco
    // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
    const assinatura = await prisma.assinatura.findFirst({
      where: {
        // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripeSubscriptionId: subscription.id,
      },
    });
    
    if (!assinatura) {
      console.log(`Assinatura ${subscription.id} não encontrada no banco`);
      return;
    }
    
    // Atualizar status
    await prisma.assinatura.update({
      where: { id: assinatura.id },
      data: {
        status: "CANCELADA",
        dataExpiracao: new Date(), // Cancelada imediatamente
      },
    });
    
    console.log(`Assinatura ${subscription.id} marcada como cancelada`);
  } catch (error) {
    console.error("Erro ao processar cancelamento de assinatura:", error);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  
  try {
    // Encontrar assinatura no banco
    // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
    const assinatura = await prisma.assinatura.findFirst({
      where: {
        // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripeSubscriptionId: invoice.subscription as string,
      },
    });
    
    if (!assinatura) {
      console.log(`Assinatura para fatura ${invoice.id} não encontrada`);
      return;
    }
    
    // Registrar renovação da assinatura
    // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
    await prisma.renovacaoAssinatura.create({
      data: {
        assinaturaId: assinatura.id,
        dataPagamento: new Date(invoice.status_transitions.paid_at || Date.now()),
        valor: (invoice.amount_paid || 0) / 100,
        status: "PAGO",
        formaPagamento: "CARTAO",
        // Removido campo gateway que não existe no modelo RenovacaoAssinatura
        // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripeInvoiceId: invoice.id,
        // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripePaymentIntentId: invoice.payment_intent as string,
      },
    });
    
    // Atualizar data de expiração da assinatura
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    
    await prisma.assinatura.update({
      where: { id: assinatura.id },
      data: {
        dataExpiracao: new Date(subscription.current_period_end * 1000),
        status: "ATIVA", // Garantir que o status esteja ativo após pagamento
      },
    });
    
    console.log(`Renovação registrada para assinatura ${assinatura.id}`);
  } catch (error) {
    console.error("Erro ao processar fatura paga:", error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  
  try {
    // Encontrar assinatura no banco
    // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
    const assinatura = await prisma.assinatura.findFirst({
      where: {
        // @ts-ignore - campos do Stripe existem no schema mas podem não estar refletidos nos tipos gerados
        stripeSubscriptionId: invoice.subscription as string,
      },
    });
    
    if (!assinatura) {
      console.log(`Assinatura para fatura ${invoice.id} não encontrada`);
      return;
    }
    
    // Atualizar status da assinatura
    await prisma.assinatura.update({
      where: { id: assinatura.id },
      data: {
        status: "PENDENTE", // Marca como pendente enquanto não for resolvido
      },
    });
    
    console.log(`Assinatura ${assinatura.id} marcada como pendente devido a falha de pagamento`);
  } catch (error) {
    console.error("Erro ao processar falha de pagamento de fatura:", error);
  }
}
