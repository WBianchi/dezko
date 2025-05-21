import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Constantes do Mercado Pago
const MERCADO_PAGO_APP_ID = process.env.MERCADO_PAGO_APP_ID;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/espaco/mercadopago/callback`;

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verificar configuração do Mercado Pago
    if (!MERCADO_PAGO_APP_ID) {
      console.error("Variáveis de ambiente do Mercado Pago não configuradas");
      return new NextResponse("Configuração incompleta", { status: 500 });
    }

    // Buscar espaço para obter o ID
    const espaco = await prisma.espaco.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!espaco) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Criar URL de autorização do Mercado Pago
    const authUrl = new URL("https://auth.mercadopago.com.br/authorization");
    
    // Adicionar parâmetros
    authUrl.searchParams.append("client_id", MERCADO_PAGO_APP_ID);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("platform_id", "mp");
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    
    // Estado para verificação posterior - inclui o ID do espaço
    const state = Buffer.from(JSON.stringify({ espacoId: espaco.id })).toString('base64');
    authUrl.searchParams.append("state", state);

    return NextResponse.json({ url: authUrl.toString() });
  } catch (error) {
    console.error("[ESPACO_MP_AUTH_URL_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
