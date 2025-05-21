import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar autenticação e permissão
    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // @ts-ignore - campos existem no banco mas não nos tipos
    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: "Acesso restrito a administradores" },
        { status: 403 }
      );
    }

    // Buscar todas as assinaturas com dados relacionados
    const assinaturas = await prisma.assinatura.findMany({
      include: {
        espaco: {
          select: {
            id: true,
            nome: true,
            email: true,
            fotoPrincipal: true
          }
        },
        plano: {
          select: {
            id: true,
            nome: true
          }
        },
        renovacoes: {
          orderBy: {
            dataPagamento: 'desc'
          },
          take: 5
        }
      },
      orderBy: [
        { status: 'asc' },
        { dataExpiracao: 'desc' }
      ]
    });

    return NextResponse.json(assinaturas);
  } catch (error) {
    console.error("Erro ao buscar assinaturas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de assinaturas" },
      { status: 500 }
    );
  }
}
