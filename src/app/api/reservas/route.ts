import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma } from "@prisma/client"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { espacoId, dataInicio, dataFim, agendaId } = body

    // Validar dados
    if (!espacoId || !dataInicio || !dataFim || !agendaId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se o espaço existe
    const espaco = await prisma.espaco.findUnique({
      where: { id: espacoId }
    })

    if (!espaco) {
      return NextResponse.json({ error: "Espaço não encontrado" }, { status: 404 })
    }

    // Verificar se a agenda existe
    const agenda = await prisma.agenda.findUnique({
      where: { id: agendaId }
    })

    if (!agenda) {
      return NextResponse.json({ error: "Agenda não encontrada" }, { status: 404 })
    }

    // Calcular o valor baseado no tipo de reserva da agenda
    let valorReserva = 0
    const duracao = Math.abs(new Date(dataFim).getTime() - new Date(dataInicio).getTime())
    const horasReserva = duracao / (1000 * 60 * 60)

    switch (agenda.tipoReserva) {
      case "HORA":
        if (!agenda.valorHora) {
          return NextResponse.json({ error: "Valor por hora não definido" }, { status: 400 })
        }
        valorReserva = agenda.valorHora * horasReserva
        break
      case "TURNO":
        if (!agenda.valorTurno) {
          return NextResponse.json({ error: "Valor por turno não definido" }, { status: 400 })
        }
        valorReserva = agenda.valorTurno
        break
      case "DIA":
        if (!agenda.valorDia) {
          return NextResponse.json({ error: "Valor por dia não definido" }, { status: 400 })
        }
        const diasReserva = Math.ceil(horasReserva / 24)
        valorReserva = agenda.valorDia * diasReserva
        break
      default:
        return NextResponse.json({ error: "Tipo de reserva inválido" }, { status: 400 })
    }

    // Verificar se já existe uma reserva para o mesmo período
    const reservaExistente = await prisma.pedido.findFirst({
      where: {
        espacoId,
        agendaId,
        NOT: {
          statusPedido: "CANCELADO"
        },
        OR: [
          {
            AND: [
              { dataInicio: { lte: new Date(dataInicio) } },
              { dataFim: { gte: new Date(dataInicio) } }
            ]
          },
          {
            AND: [
              { dataInicio: { lte: new Date(dataFim) } },
              { dataFim: { gte: new Date(dataFim) } }
            ]
          }
        ]
      }
    })

    if (reservaExistente) {
      return NextResponse.json({ error: "Já existe uma reserva para este período" }, { status: 409 })
    }

    // Buscar o usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Criar o pedido
    const pedido = await prisma.pedido.create({
      data: {
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        valor: valorReserva,
        statusPedido: "PENDENTE",
        formaPagamento: "PIX",
        agenda: {
          connect: {
            id: agendaId
          }
        },
        espaco: {
          connect: {
            id: espacoId
          }
        },
        usuario: {
          connect: {
            id: usuario.id
          }
        },
        plano: {
          connect: {
            id: "64cd2078-932c-4574-911b-afeda81c9950"
          }
        }
      }
    })

    // Criar automaticamente a reserva com status PENDENTE
    const reserva = await prisma.reservation.create({
      data: {
        userId: usuario.id,
        status: 'PENDENTE',
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        espacoId,
        mercadoPagoPaymentId: pedido.mercadoPagoPaymentId || '',
        mercadoPagoPreferenceId: pedido.mercadoPagoPreferenceId || '',
        planoId: "64cd2078-932c-4574-911b-afeda81c9950",
        valor: valorReserva,
        agendaId
      }
    })

    console.log(`Pedido ${pedido.id} e Reserva ${reserva.id} criados com status PENDENTE`);

    // Retornar informações do pedido e da reserva
    return NextResponse.json({
      pedido,
      reserva
    })
  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 })
  }
}
