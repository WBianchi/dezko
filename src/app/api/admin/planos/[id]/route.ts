import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    id: string
  }
}

// GET - Obter plano por ID
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = params

    // Buscar o plano pelo ID com seus benefícios
    const plano = await prisma.plano.findUnique({
      where: { id },
      include: {
        beneficiosPlano: true
      }
    })

    if (!plano) {
      return NextResponse.json(
        { message: "Plano não encontrado" },
        { status: 404 }
      )
    }

    // Formatar a resposta
    const response = {
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
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar plano:', error)
    return NextResponse.json(
      { message: "Ocorreu um erro ao buscar o plano" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar plano
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = params
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

    // Verificar se o plano existe
    const planoExistente = await prisma.plano.findUnique({
      where: { id }
    })

    if (!planoExistente) {
      return NextResponse.json(
        { message: "Plano não encontrado" },
        { status: 404 }
      )
    }

    // Atualizar o plano
    await prisma.plano.update({
      where: { id },
      data: {
        nome: body.nome,
        preco: body.preco,
        descricao: body.descricao || '',
        duracao: body.duracao,
        limiteAgendas: body.limiteAgendas,
        tipo: body.tipo
      }
    })

    // Atualizar os benefícios do plano
    if (body.beneficios) {
      // Remover todos os benefícios existentes
      await prisma.beneficioPlano.deleteMany({
        where: { planoId: id }
      })

      // Adicionar os novos benefícios
      for (const beneficio of body.beneficios) {
        await prisma.beneficioPlano.create({
          data: {
            nome: beneficio.nome,
            planoId: id
          }
        })
      }
    }

    // Buscar o plano atualizado para retornar
    const planoAtualizado = await prisma.plano.findUnique({
      where: { id },
      include: {
        beneficiosPlano: true
      }
    })

    // Formatar a resposta
    const response = {
      id: planoAtualizado?.id,
      nome: planoAtualizado?.nome,
      preco: planoAtualizado?.preco,
      descricao: planoAtualizado?.descricao || '',
      duracao: planoAtualizado?.duracao,
      limiteAgendas: planoAtualizado?.limiteAgendas,
      tipo: planoAtualizado?.tipo,
      beneficios: planoAtualizado?.beneficiosPlano.map(beneficio => ({
        id: beneficio.id,
        nome: beneficio.nome
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao atualizar plano:', error)
    return NextResponse.json(
      { message: "Ocorreu um erro ao atualizar o plano" },
      { status: 500 }
    )
  }
}

// DELETE - Excluir plano
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = params

    // Verificar se o plano existe
    const planoExistente = await prisma.plano.findUnique({
      where: { id }
    })

    if (!planoExistente) {
      return NextResponse.json(
        { message: "Plano não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se o plano está em uso
    const planosEmUso = await prisma.pedido.count({
      where: { planoId: id }
    })

    if (planosEmUso > 0) {
      return NextResponse.json(
        { message: "Este plano está em uso e não pode ser excluído" },
        { status: 400 }
      )
    }

    // Remover os benefícios do plano
    await prisma.beneficioPlano.deleteMany({
      where: { planoId: id }
    })

    // Remover o plano
    await prisma.plano.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Plano excluído com sucesso" })
  } catch (error) {
    console.error('Erro ao excluir plano:', error)
    return NextResponse.json(
      { message: "Ocorreu um erro ao excluir o plano" },
      { status: 500 }
    )
  }
}
