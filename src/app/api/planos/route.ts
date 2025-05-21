import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todos os planos (endpoint público)
export async function GET() {
  try {
    // Buscar todos os planos com seus benefícios
    const planos = await prisma.plano.findMany({
      include: {
        beneficiosPlano: true
      },
      orderBy: {
        preco: 'asc'
      }
    })

    // Formatar os planos para o formato usado no frontend
    const formattedPlanos = planos.map(plano => ({
      id: plano.id,
      nome: plano.nome,
      preco: plano.preco,
      descricao: plano.descricao || '',
      duracao: plano.duracao,
      limiteAgendas: plano.limiteAgendas,
      tipo: plano.tipo,
      recursos: plano.beneficiosPlano.map(beneficio => beneficio.nome).join(',')
    }))

    return NextResponse.json(formattedPlanos)
  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    return NextResponse.json(
      { message: "Ocorreu um erro ao buscar os planos" },
      { status: 500 }
    )
  }
}
