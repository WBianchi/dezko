import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    // Busca o espaço do usuário
    const espaco = await prisma.espaco.findFirst({
      where: {
        email: session.user.email
      }
    })

    if (!espaco) {
      return new NextResponse("Espaço não encontrado", { status: 404 })
    }

    // Busca as avaliações do espaço
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        espacoId: espaco.id
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatar as avaliações para corresponder à interface esperada pelo front-end
    const avaliacoesFormatadas = avaliacoes.map(avaliacao => ({
      id: avaliacao.id,
      estrelas: avaliacao.nota,
      comentario: avaliacao.comentario,
      usuario: avaliacao.usuario,
      createdAt: avaliacao.createdAt,
      updatedAt: avaliacao.updatedAt
    }))

    return NextResponse.json(avaliacoesFormatadas)
  } catch (error) {
    console.error("[ESPACO_AVALIACOES_GET]", error)
    return new NextResponse("Erro interno", { status: 500 })
  }
}
