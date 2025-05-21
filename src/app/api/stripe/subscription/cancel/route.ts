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
    const { assinaturaId } = await req.json();

    if (!assinaturaId) {
      return NextResponse.json(
        { error: "ID da assinatura é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar dados da assinatura
    const assinatura = await prisma.assinatura.findUnique({
      where: { id: assinaturaId },
      include: {
        espaco: true
      }
    });

    if (!assinatura) {
      return NextResponse.json(
        { error: "Assinatura não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é dono do espaço ou admin
    // @ts-ignore - campos existem no banco mas não nos tipos
    if (session.user?.role === 'espaco' && session.user.espacoId !== assinatura.espacoId) {
      return NextResponse.json(
        { error: "Você não tem permissão para cancelar esta assinatura" },
        { status: 403 }
      );
    }

    // Se existir uma assinatura no Stripe, cancelar
    // @ts-ignore - o campo existe no schema do Prisma mas pode não estar nos tipos gerados
    if (assinatura.stripeSubscriptionId) {
      try {
        // @ts-ignore - o campo existe no schema do Prisma mas pode não estar nos tipos gerados
        await stripe.subscriptions.cancel(assinatura.stripeSubscriptionId);
      } catch (error) {
        console.error("Erro ao cancelar assinatura no Stripe:", error);
        // Continuar mesmo se o cancelamento no Stripe falhar
      }
    }

    // Atualizar status da assinatura no banco
    await prisma.assinatura.update({
      where: { id: assinaturaId },
      data: { 
        status: "CANCELADA",
        dataExpiracao: new Date() // Define a data de expiração para agora
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assinatura cancelada com sucesso"
    });
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao cancelar assinatura" },
      { status: 500 }
    );
  }
}
