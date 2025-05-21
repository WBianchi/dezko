import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar todos os planos
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

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
      beneficios: plano.beneficiosPlano.map(beneficio => ({
        id: beneficio.id,
        nome: beneficio.nome
      }))
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

// POST - Criar um novo plano
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Verificar se apenas o nome é obrigatório
    if (!body.nome || body.nome.trim() === '') {
      return NextResponse.json(
        { message: "Nome do plano é obrigatório" },
        { status: 400 }
      )
    }
    
    // Garantir que os valores numéricos são números válidos (podem ser zero)
    if (isNaN(body.preco) || isNaN(body.duracao) || isNaN(body.limiteAgendas)) {
      return NextResponse.json(
        { message: "Valores numéricos inválidos" },
        { status: 400 }
      )
    }
    
    // Garantir que comissao existe, se fornecida
    if (body.comissao && (typeof body.comissao !== 'object' || isNaN(body.comissao.valor))) {
      return NextResponse.json(
        { message: "Configuração de comissão inválida" },
        { status: 400 }
      )
    }

    // Buscar um espaço existente para associar ao plano
    const espaco = await prisma.espaco.findFirst({
      select: {
        id: true
      }
    })

    if (!espaco) {
      return NextResponse.json(
        { message: "Não foi possível encontrar um espaço para associar o plano" },
        { status: 400 }
      )
    }

    // Criar o plano no banco de dados
    const plano = await prisma.plano.create({
      data: {
        nome: body.nome,
        preco: body.preco,
        descricao: body.descricao || '',
        duracao: body.duracao,
        limiteAgendas: body.limiteAgendas || 2,
        tipo: body.tipo || 'basico',
        espacoId: espaco.id,
        // Criar comissão relacionada se fornecida
        commission: body.comissao ? {
          create: {
            commissionType: body.comissao.tipo || 'percentage',
            commissionValue: body.comissao.valor || 0
          }
        } : {
          create: {
            commissionType: 'percentage',
            commissionValue: 0
          }
        }
      }
    })

    // Adicionar os benefícios do plano
    if (body.beneficios && body.beneficios.length > 0) {
      for (const beneficio of body.beneficios) {
        await prisma.beneficioPlano.create({
          data: {
            nome: beneficio.nome,
            planoId: plano.id
          }
        })
      }
    }

    // Buscar o plano completo para retornar
    const planoCompleto = await prisma.plano.findUnique({
      where: { id: plano.id },
      include: {
        beneficiosPlano: true
      }
    })

    // Formatar a resposta
    const response = {
      id: planoCompleto?.id,
      nome: planoCompleto?.nome,
      preco: planoCompleto?.preco,
      descricao: planoCompleto?.descricao || '',
      duracao: planoCompleto?.duracao,
      limiteAgendas: planoCompleto?.limiteAgendas,
      tipo: planoCompleto?.tipo,
      beneficios: planoCompleto?.beneficiosPlano.map(beneficio => ({
        id: beneficio.id,
        nome: beneficio.nome
      }))
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar plano:', error)
    return NextResponse.json(
      { message: "Ocorreu um erro ao criar o plano" },
      { status: 500 }
    )
  }
}
