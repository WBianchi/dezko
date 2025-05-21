import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo")

    if (!tipo) {
      return NextResponse.json({ error: "Tipo não fornecido" }, { status: 400 })
    }

    const config = await prisma.configuracao.findFirst({
      where: {
        tipo
      }
    })

    if (!config) {
      return NextResponse.json({ error: "Configuração não encontrada" }, { status: 404 })
    }

    return NextResponse.json(JSON.parse(config.valor))
  } catch (error) {
    console.error("Erro ao buscar configuração:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
