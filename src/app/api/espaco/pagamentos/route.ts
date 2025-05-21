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

    // Busca os pedidos do espaço
    const pedidos = await prisma.pedido.findMany({
      where: {
        espacoId: espaco.id
      },
      include: {
        usuario: true,
        espaco: true,
        agenda: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Encontrados ${pedidos.length} pedidos para o espaço ${espaco.id}`)

    // Formata os dados para a tabela
    const formattedPedidos = pedidos.map((pedido) => ({
      id: pedido.id,
      usuario: pedido.usuario?.nome || "Usuário não encontrado",
      reserva: {
        id: pedido.id,
        agenda: {
          tipoReserva: pedido.agenda?.tipoReserva || "Não especificado"
        }
      },
      valor: pedido.valor,
      status: pedido.statusPedido,
      gateway: "mercadopago",
      formaPagamento: pedido.formaPagamento || "Não especificado",
      createdAt: pedido.createdAt,
      dataInicio: pedido.dataInicio,
      dataFim: pedido.dataFim
    }))

    return NextResponse.json(formattedPedidos)
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error)
    return new NextResponse("Erro ao buscar pedidos", { status: 500 })
  }
}
