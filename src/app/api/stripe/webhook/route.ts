import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Função para lidar com os diversos eventos do Stripe
async function handleStripeEvent(
  event: Stripe.Event,
  stripe: Stripe
): Promise<{ success: boolean; message: string }> {
  try {
    const eventType = event.type;
    console.log(`Processando evento do Stripe: ${eventType}`);

    switch (eventType) {
      // Pagamento bem-sucedido
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Verificar se o pagamento está associado a uma reserva
        if (paymentIntent.metadata?.reservaId) {
          const reservaId = paymentIntent.metadata.reservaId;
          
          // Atualizar o status da reserva para confirmado
          await prisma.reservation.update({
            where: { id: reservaId },
            data: { status: "CONFIRMADO" },
          });
          
          // Criar um registro de pagamento
          await prisma.pagamento.create({
            data: {
              reservaId: reservaId,
              valor: paymentIntent.amount / 100, // Converter de centavos para reais
              status: "concluido",
              gateway: "stripe",
              gatewayId: paymentIntent.id,
              metadata: {
                paymentIntentId: paymentIntent.id,
                paymentMethod: paymentIntent.payment_method_types[0],
                currency: paymentIntent.currency,
                amountReceived: paymentIntent.amount_received / 100,
              },
            },
          });
          
          return { success: true, message: `Pagamento processado para reserva ${reservaId}` };
        }
        return { success: true, message: "Pagamento processado, mas não associado a uma reserva" };
      }

      // Pagamento falhou
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        if (paymentIntent.metadata?.reservaId) {
          const reservaId = paymentIntent.metadata.reservaId;
          
          // Atualizar o status da reserva para pendente ou rejeitado
          await prisma.reservation.update({
            where: { id: reservaId },
            data: { status: "PENDENTE" },
          });
          
          // Criar um registro de pagamento falho
          await prisma.pagamento.create({
            data: {
              reservaId: reservaId,
              valor: paymentIntent.amount / 100,
              status: "falha",
              gateway: "stripe",
              gatewayId: paymentIntent.id,
              metadata: {
                paymentIntentId: paymentIntent.id,
                failureCode: paymentIntent.last_payment_error?.code || "unknown",
                failureMessage: paymentIntent.last_payment_error?.message || "Falha no pagamento",
              },
            },
          });
          
          return { success: true, message: `Falha no pagamento registrada para reserva ${reservaId}` };
        }
        return { success: true, message: "Falha no pagamento processada, mas não associada a uma reserva" };
      }

      // Account updated - usado para acompanhar mudanças nas contas connect
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const accountId = account.id;
        
        // Buscar o espaço associado a esta conta Stripe
        const espaco = await prisma.espaco.findFirst({
          where: { stripeConnectAccountId: accountId },
        });
        
        if (espaco) {
          // Atualizar o status da conta Connect com base nos detalhes da conta
          const connectStatus = account.charges_enabled ? "connected" : "pending";
          
          // Atualizar a configuração do espaço
          const existingConfig = await prisma.spaceConfig.findUnique({
            where: { id: espaco.id },
          });
          
          if (existingConfig) {
            // Extrair configuração atual
            let mercadoPagoConfig: any = {};
            try {
              mercadoPagoConfig = typeof existingConfig.mercadoPago === 'string'
                ? JSON.parse(existingConfig.mercadoPago as string)
                : existingConfig.mercadoPago || {};
            } catch (err) {
              mercadoPagoConfig = {};
            }
            
            // Atualizar configuração
            await prisma.spaceConfig.update({
              where: { id: espaco.id },
              data: {
                mercadoPago: {
                  ...mercadoPagoConfig,
                  stripeEnabled: account.charges_enabled,
                  stripeConnectStatus: connectStatus,
                  stripeAccountId: accountId,
                },
              },
            });
          }
          
          return { success: true, message: `Conta Connect atualizada para espaço ${espaco.id}` };
        }
        return { success: true, message: "Atualização de conta processada, mas não associada a um espaço" };
      }

      // Outros eventos que você pode querer processar
      default:
        return { success: true, message: `Evento ${eventType} recebido, mas não processado` };
    }
  } catch (error) {
    console.error("Erro ao processar evento do Stripe:", error);
    return { success: false, message: `Erro ao processar evento: ${error}` };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    // Inicializar o Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia" as any,
    });

    let event;

    try {
      // Verificar a assinatura do webhook para garantir que veio do Stripe
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error(`Erro na assinatura do webhook: ${err.message}`);
      return NextResponse.json(
        { error: `Assinatura inválida: ${err.message}` },
        { status: 400 }
      );
    }

    // Processar o evento
    const result = await handleStripeEvent(event, stripe);

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    } else {
      console.error("Erro ao processar evento:", result.message);
      return NextResponse.json(
        { error: "Erro ao processar evento", details: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro no webhook do Stripe:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
