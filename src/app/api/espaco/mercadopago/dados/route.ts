import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
        nome: true,
        mercadoPagoAccessToken: true,
        mercadoPagoRefreshToken: true,
        mercadoPagoUserId: true,
        mercadoPagoTokenExpiresAt: true,
        mercadoPagoIntegrated: true,
        mercadoPagoPublicKey: true,
        razaoSocial: true,
        cnpj: true,
        updatedAt: true,
      },
    });

    if (!espaco) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    return NextResponse.json(espaco);
  } catch (error) {
    console.error("[ESPACO_MP_DADOS_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
