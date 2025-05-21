import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }
    
    // Buscar espaço associado ao usuário logado
    const email = session.user?.email as string
    
    // Primeiro encontramos o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { 
        email: email
      }
    })
    
    if (!usuario) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }
    
    // Depois buscamos o espaço relacionado ao usuário
    const espaco = await prisma.espaco.findFirst({
      where: {
        usuarios: {
          some: {
            id: usuario.id
          }
        }
      }
    })
    
    if (!espaco) {
      return NextResponse.json(
        { message: "Usuário não possui espaço associado" },
        { status: 404 }
      )
    }
    
    const espacoId = espaco.id
    
    // Obter data atual
    const hoje = new Date()
    
    // Obter primeiro dia do mês atual
    const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const ultimoDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    
    // Obter primeiro e último dia do mês anterior
    const primeiroDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
    
    // Buscar reservas do mês atual
    const reservasMesAtual = await prisma.reservation.count({
      where: {
        espacoId,
        dataInicio: {
          gte: primeiroDiaMesAtual,
          lte: ultimoDiaMesAtual
        }
      }
    })
    
    // Buscar reservas do mês anterior
    const reservasMesAnterior = await prisma.reservation.count({
      where: {
        espacoId,
        dataInicio: {
          gte: primeiroDiaMesAnterior,
          lte: ultimoDiaMesAnterior
        }
      }
    })
    
    // Calcular tendência de crescimento
    let porcentagemCrescimento = 0
    
    if (reservasMesAnterior > 0) {
      porcentagemCrescimento = Math.round(
        ((reservasMesAtual - reservasMesAnterior) / reservasMesAnterior) * 100
      )
    } else if (reservasMesAtual > 0) {
      // Se não havia reservas no mês anterior, mas há neste mês, considerar crescimento de 100%
      porcentagemCrescimento = 100
    }
    
    return NextResponse.json({
      porcentagem: porcentagemCrescimento
    })
  } catch (error) {
    console.error("[ESPACO_DASHBOARD_TENDENCIA]", error)
    return NextResponse.json(
      { message: "Erro ao calcular tendência de crescimento" },
      { status: 500 }
    )
  }
}
