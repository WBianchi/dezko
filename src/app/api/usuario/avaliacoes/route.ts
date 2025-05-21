import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET: Busca todas as avaliações feitas pelo usuário autenticado
 */
export async function GET() {
  try {
    // Verifica a sessão do usuário
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Obtém o id do usuário da sessão
    const userId = session.user.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado na sessão' },
        { status: 400 }
      )
    }

    console.log('Buscando avaliações feitas pelo usuário:', userId)

    // Busca todas as avaliações feitas pelo usuário
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        usuarioId: userId
      },
      include: {
        espaco: {
          select: {
            id: true,
            nome: true,
            endereco: true,
            cidade: true,
            estado: true,
            fotoPrincipal: true
          }
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Encontradas ${avaliacoes.length} avaliações feitas pelo usuário ${userId}`)
    
    // Calcular estatísticas
    const totalAvaliacoes = avaliacoes.length
    const mediaEstrelas = avaliacoes.length > 0 
      ? avaliacoes.reduce((total: number, a: any) => total + a.nota, 0) / avaliacoes.length 
      : 0
    const cincoEstrelas = avaliacoes.filter((a: any) => a.nota === 5).length
    const espacosAvaliados = new Set(avaliacoes.map((a: any) => a.espacoId)).size
    
    // Formatar os dados para retorno
    const avaliacoesFormatadas = avaliacoes.map((avaliacao: any) => ({
      id: avaliacao.id,
      estrelas: avaliacao.nota,
      comentario: avaliacao.comentario,
      espaco: avaliacao.espaco,
      usuario: avaliacao.usuario,
      createdAt: avaliacao.createdAt,
      updatedAt: avaliacao.updatedAt
    }))

    // Retorna os dados e estatísticas
    return NextResponse.json({
      avaliacoes: avaliacoes.map((avaliacao: any) => ({
        id: avaliacao.id,
        estrelas: avaliacao.nota,
        comentario: avaliacao.comentario,
        espaco: avaliacao.espaco,
        usuario: avaliacao.usuario,
        createdAt: avaliacao.createdAt,
        updatedAt: avaliacao.updatedAt
      })),
      estatisticas: {
        totalAvaliacoes,
        mediaEstrelas,
        cincoEstrelas,
        espacosAvaliados
      }
    })

  } catch (error) {
    console.error('Erro ao buscar avaliações do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    )
  }
}
