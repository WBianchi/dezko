import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    const mercadoPago = await prisma.configuracao.findUnique({
      where: { tipo: "mercadopago" }
    })

    const commission = await prisma.configuracao.findUnique({
      where: { tipo: "comissao" }
    })

    const spaceCommissions = await prisma.spaceCommission.findMany({
      include: {
        espaco: true
      }
    })

    return NextResponse.json({
      mercadoPago: mercadoPago?.valor ? JSON.parse(mercadoPago.valor) : null,
      commission: commission?.valor ? JSON.parse(commission.valor) : null,
      spaceCommissions
    })
  } catch (error) {
    console.error("[ADMIN_SPLIT_GET]", error)
    return new NextResponse("Erro interno", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    const body = await req.json()
    const { mercadoPago, commission } = body

    // Salvar configuração do Mercado Pago
    await prisma.configuracao.upsert({
      where: { tipo: "mercadopago" },
      create: {
        tipo: "mercadopago",
        valor: JSON.stringify(mercadoPago)
      },
      update: {
        valor: JSON.stringify(mercadoPago)
      }
    })

    // Salvar configuração da comissão
    await prisma.configuracao.upsert({
      where: { tipo: "comissao" },
      create: {
        tipo: "comissao",
        valor: JSON.stringify(commission)
      },
      update: {
        valor: JSON.stringify(commission)
      }
    })

    return NextResponse.json({
      mercadoPago: JSON.parse((await prisma.configuracao.findUnique({ where: { tipo: "mercadopago" } })).valor),
      commission: JSON.parse((await prisma.configuracao.findUnique({ where: { tipo: "comissao" } })).valor)
    })
  } catch (error) {
    console.error("[ADMIN_SPLIT_POST]", error)
    return new NextResponse("Erro interno", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    const body = await req.json()
    const { spaceId, type, value } = body

    // Atualiza ou cria comissão específica do espaço
    const spaceCommission = await prisma.spaceCommission.upsert({
      where: {
        spaceId
      },
      create: {
        spaceId,
        type,
        value,
        active: true
      },
      update: {
        type,
        value,
        active: true
      }
    })

    return NextResponse.json(spaceCommission)
  } catch (error) {
    console.error("[ADMIN_SPLIT_PATCH]", error)
    return new NextResponse("Erro interno", { status: 500 })
  }
}
