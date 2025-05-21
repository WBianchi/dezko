import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  try {
    console.log("[AGENDAS_GET] Iniciando...")

    const session = await getServerSession(authOptions)
    console.log("[AGENDAS_GET] Session:", session)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const espaco = await prisma.espaco.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        agendas: true
      }
    })

    console.log("[AGENDAS_GET] Espaço encontrado:", espaco)

    if (!espaco) {
      console.log("[AGENDAS_GET] Espaço não encontrado")
      return NextResponse.json(
        { message: "Espaço não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(espaco.agendas)
  } catch (error) {
    console.error("[AGENDAS_GET]", error)
    return NextResponse.json(
      { message: "Erro ao buscar agendas" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    console.log("[AGENDAS_POST] Iniciando...")

    const session = await getServerSession(authOptions)
    console.log("[AGENDAS_POST] Session:", session)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const espaco = await prisma.espaco.findUnique({
      where: {
        id: session.user.id,
      }
    })

    console.log("[AGENDAS_POST] Espaço encontrado:", espaco)

    if (!espaco) {
      console.log("[AGENDAS_POST] Espaço não encontrado")
      return NextResponse.json(
        { message: "Espaço não encontrado" },
        { status: 404 }
      )
    }

    const body = await req.json()
    console.log("[AGENDAS_POST] Body:", body)

    const {
      titulo,
      descricao,
      tipoReserva,
      turno,
      horaInicio,
      horaFim,
      dataInicio,
      dataFim,
      valorHora,
      valorTurno,
      valorDia
    } = body

    const agenda = await prisma.agenda.create({
      data: {
        titulo,
        descricao,
        tipoReserva,
        turno,
        horaInicio,
        horaFim,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        valorHora,
        valorTurno,
        valorDia,
        espacoId: espaco.id
      }
    })

    console.log("[AGENDAS_POST] Agenda criada:", agenda)
    return NextResponse.json(agenda)
  } catch (error) {
    console.error("[AGENDAS_POST] Erro:", error)
    return NextResponse.json(
      { message: "Erro ao criar agenda" },
      { status: 500 }
    )
  }
}
