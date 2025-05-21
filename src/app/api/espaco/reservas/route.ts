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

    // Busca as reservas do espaço
    const reservas = await prisma.reservation.findMany({
      where: {
        espacoId: espaco.id
      },
      include: {
        usuario: true,
        agenda: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formata os dados para a tabela
    const formattedReservas = reservas.map((reserva) => ({
      id: reserva.id,
      usuario: reserva.usuario.nome,
      agenda: reserva.agenda,
      dataInicio: reserva.dataInicio,
      dataFim: reserva.dataFim,
      valor: reserva.valor,
      status: reserva.status,
      createdAt: reserva.createdAt
    }))

    return NextResponse.json(formattedReservas)
  } catch (error) {
    console.error("[ESPACO_RESERVAS_GET]", error)
    return new NextResponse("Erro interno", { status: 500 })
  }
}
