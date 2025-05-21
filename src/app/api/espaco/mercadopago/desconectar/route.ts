import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Buscar espaço pelo email do usuário
    const espaco = await prisma.espaco.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        mercadoPagoAccessToken: true,
      },
    });

    if (!espaco) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Se houver token, revogar no Mercado Pago
    if (espaco.mercadoPagoAccessToken) {
      try {
        // Revogar o token no Mercado Pago
        await fetch("https://api.mercadopago.com/oauth/revoke", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${espaco.mercadoPagoAccessToken}`
          },
          body: JSON.stringify({
            token: espaco.mercadoPagoAccessToken
          })
        });
      } catch (error) {
        console.error("Erro ao revogar token no Mercado Pago:", error);
        // Continuar mesmo com erro, para garantir que os dados sejam limpos localmente
      }
    }

    // Atualizar o espaço removendo os dados de integração
    await prisma.espaco.update({
      where: {
        id: espaco.id,
      },
      data: {
        mercadoPagoAccessToken: null,
        mercadoPagoRefreshToken: null,
        mercadoPagoUserId: null,
        mercadoPagoTokenExpiresAt: null,
        mercadoPagoPublicKey: null,
        mercadoPagoIntegrated: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ESPACO_MP_DESCONECTAR_POST]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
