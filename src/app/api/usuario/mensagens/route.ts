import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET: Busca todas as mensagens do usuário autenticado
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

    console.log('Buscando mensagens para o usuário:', userId)

    // Busca todas as mensagens do usuário
    const mensagens = await prisma.mensagem.findMany({
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Encontradas ${mensagens.length} mensagens para o usuário ${userId}`)
    
    // Calcular estatísticas
    const totalMensagens = mensagens.length
    // Contagem de mensagens não lidas - seguro para o caso de esquema antigo
    const mensagensNaoLidas = 0 // Valor padrão para evitar erros
    const mensagensHoje = mensagens.filter(m => {
      const hoje = new Date()
      const dataMensagem = new Date(m.createdAt)
      return dataMensagem.getDate() === hoje.getDate() &&
             dataMensagem.getMonth() === hoje.getMonth() &&
             dataMensagem.getFullYear() === hoje.getFullYear()
    }).length
    const espacosEmContato = new Set(mensagens.map(m => m.espacoId)).size
    
    // Formatar os dados para retorno - preservando dados originais
    const mensagensFormatadas = mensagens

    // Retorna os dados e estatísticas
    console.log('Retornando mensagens formatadas:', mensagens.length)
    
    return NextResponse.json({
      mensagens,
      estatisticas: {
        totalMensagens,
        mensagensNaoLidas,
        mensagensHoje,
        espacosEmContato
      }
    })

  } catch (error) {
    console.error('Erro ao buscar mensagens do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar mensagens' },
      { status: 500 }
    )
  }
}
