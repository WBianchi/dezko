import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("espacoId") || searchParams.get("state");
    const error = searchParams.get("error");

    // URL base para redirecionamento
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (
      process.env.NODE_ENV === "production" 
        ? "https://dezko.com.br" 
        : "http://localhost:3000"
    );
    
    console.log("URL base para redirecionamento em callback:", baseUrl);

    // Se houver um erro, redirecionar para a página de configurações com o erro
    if (error) {
      console.error("[STRIPE-CONNECT-CALLBACK] Erro:", error);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/espaco/config-pagamentos?error=${error}`
      );
    }

    // Verificar se temos o código de autorização e o ID do espaço
    if (!code || !state) {
      console.error("[STRIPE-CONNECT-CALLBACK] Falta código ou ID do espaço");
      return NextResponse.redirect(
        `${baseUrl}/dashboard/espaco/config-pagamentos?error=missing_parameters`
      );
    }

    // Iniciar o Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia" as any,
    });

    // Trocar o código de autorização por um token de acesso
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    // Verificar se temos um connected account ID
    if (!response.stripe_user_id) {
      console.error("[STRIPE-CONNECT-CALLBACK] Sem stripe_user_id na resposta");
      return NextResponse.redirect(
        `${baseUrl}/dashboard/espaco/config-pagamentos?error=no_account_id`
      );
    }

    // Verificar se o espaço existe
    const espaco = await prisma.espaco.findUnique({
      where: { id: state },
    });

    if (!espaco) {
      console.error("[STRIPE-CONNECT-CALLBACK] Espaço não encontrado:", state);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/espaco/config-pagamentos?error=space_not_found`
      );
    }

    // Atualizar o espaço com o ID da conta Stripe Connect
    await prisma.espaco.update({
      where: { id: state },
      data: {
        stripeConnectAccountId: response.stripe_user_id,
      },
    });

    // Verificar e atualizar SpaceConfig
    const existingConfig = await prisma.spaceConfig.findUnique({
      where: { id: state },
    });

    if (existingConfig) {
      await prisma.spaceConfig.update({
        where: { id: state },
        data: {
          mercadoPago: {
            stripeEnabled: true,
            stripeAccountId: response.stripe_user_id,
            stripeConnectStatus: "connected",
          },
        },
      });
    } else {
      await prisma.spaceConfig.create({
        data: {
          id: state,
          mercadoPago: {
            stripeEnabled: true,
            stripeAccountId: response.stripe_user_id,
            stripeConnectStatus: "connected",
          },
        },
      });
    }

    // Redirecionar de volta para a página de configurações com uma mensagem de sucesso
    return NextResponse.redirect(
      `${baseUrl}/dashboard/espaco/config-pagamentos?success=stripe_connected`
    );
  } catch (error) {
    console.error("[STRIPE-CONNECT-CALLBACK]", error);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (
      process.env.NODE_ENV === "production" 
        ? "https://dezko.com.br" 
        : "http://localhost:3000"
    );
    
    return NextResponse.redirect(
      `${baseUrl}/dashboard/espaco/config-pagamentos?error=unexpected_error`
    );
  }
}
