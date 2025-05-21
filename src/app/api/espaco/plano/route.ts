import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }
    
    // Redirecionar para o endpoint info
    return NextResponse.json(
      { message: "Informações do plano podem ser acessadas em /api/espaco/plano/info" },
      { status: 307 }
    )
  } catch (error) {
    console.error("[ESPACO_PLANO] Erro geral:", error)
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
