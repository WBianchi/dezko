import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET: Busca todas as avaliações de um espaço específico
 */
export async function GET(
  request: Request,
  { params }: { params: { espacoId?: string } }
) {
  try {
    // Verifica se o ID do espaço foi fornecido
    const espacoId = params.espacoId
    
    if (!espacoId) {
      return NextResponse.json(
        { error: 'ID do espaço não fornecido' },
        { status: 400 }
      )
    }

    // Busca todas as avaliações do espaço especificado
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        espacoId: espacoId
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(avaliacoes)
  } catch (error) {
    console.error('Erro ao buscar avaliações do espaço:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    )
  }
}

/**
 * POST: Cria uma nova avaliação para um espaço
 */
export async function POST(
  request: Request,
  { params }: { params: { espacoId?: string } }
) {
  try {
    // Verifica a sessão do usuário
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verifica se o ID do espaço foi fornecido
    const espacoId = params.espacoId
    
    if (!espacoId) {
      return NextResponse.json(
        { error: 'ID do espaço não fornecido' },
        { status: 400 }
      )
    }

    // Obter o ID do usuário da sessão
    const userId = session.user.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado na sessão' },
        { status: 400 }
      )
    }

    // Obter os dados da avaliação do corpo da requisição
    const { nota, comentario } = await request.json()
    
    if (!nota || nota < 1 || nota > 5) {
      return NextResponse.json(
        { error: 'Nota inválida. Deve ser um número entre 1 e 5' },
        { status: 400 }
      )
    }
    
    if (!comentario || typeof comentario !== 'string' || comentario.trim() === '') {
      return NextResponse.json(
        { error: 'Comentário inválido ou vazio' },
        { status: 400 }
      )
    }

    // Verificar se o espaço existe
    const espaco = await prisma.espaco.findUnique({
      where: { id: espacoId }
    })
    
    if (!espaco) {
      return NextResponse.json(
        { error: 'Espaço não encontrado' },
        { status: 404 }
      )
    }

    // Criar a avaliação
    const novaAvaliacao = await prisma.avaliacao.create({
      data: {
        nota,
        comentario,
        usuarioId: userId,
        espacoId
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    console.log(`Nova avaliação criada: id=${novaAvaliacao.id}, usuário=${userId}, espaço=${espacoId}`)

    return NextResponse.json(novaAvaliacao)
  } catch (error) {
    console.error('Erro ao criar avaliação:', error)
    return NextResponse.json(
      { error: 'Erro ao criar avaliação' },
      { status: 500 }
    )
  }
}
