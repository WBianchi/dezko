import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const espacoId = searchParams.get("espacoId");

    if (!espacoId) {
      return NextResponse.json({ error: "ID do espaço não fornecido" }, { status: 400 });
    }

    // Verificar se o usuário tem acesso ao espaço
    const espaco = await prisma.espaco.findUnique({
      where: { id: espacoId },
    });

    if (!espaco) {
      return NextResponse.json({ error: "Espaço não encontrado" }, { status: 404 });
    }

    // Iniciar o Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia" as any,
    });

    // URL base para redirecionamento
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (
      process.env.NODE_ENV === "production" 
        ? "https://dezko.com.br" 
        : "http://localhost:3000"
    );
    
    console.log("URL base para redirecionamento:", baseUrl);

    // Construir URL manualmente para garantir o formato correto de parâmetros
    let stripeConnectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code`;
    stripeConnectUrl += `&client_id=${encodeURIComponent(process.env.STRIPE_CLIENT_ID || '')}`;
    stripeConnectUrl += `&scope=read_write`;
    stripeConnectUrl += `&redirect_uri=${encodeURIComponent(`${baseUrl}/api/stripe/connect/callback`)}`;
    stripeConnectUrl += `&state=${encodeURIComponent(espacoId)}`;
    
    // Adicionar capabilities sugeridas no formato correto
    stripeConnectUrl += `&suggested_capabilities[]=transfers`;
    stripeConnectUrl += `&suggested_capabilities[]=card_payments`;
    stripeConnectUrl += `&suggested_capabilities[]=tax_reporting_us_1099_k`;
    
    // Adicionar informações do usuário
    stripeConnectUrl += `&stripe_user[email]=${encodeURIComponent(espaco.email)}`;
    stripeConnectUrl += `&stripe_user[business_name]=${encodeURIComponent(espaco.nome)}`;
    stripeConnectUrl += `&stripe_user[country]=BR`;

    console.log("URL de conectar com Stripe:", stripeConnectUrl);
    return NextResponse.redirect(stripeConnectUrl);
  } catch (error) {
    console.error("[STRIPE-CONNECT-OAUTH]", error);
    return NextResponse.json(
      { error: "Erro ao iniciar fluxo de autorização do Stripe" },
      { status: 500 }
    );
  }
}
