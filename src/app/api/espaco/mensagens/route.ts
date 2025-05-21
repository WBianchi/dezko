import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET: Busca todas as mensagens do espaço autenticado
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

    // Obtém o email do usuário da sessão
    const userEmail = session.user.email
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email do usuário não encontrado na sessão' },
        { status: 400 }
      )
    }

    // Busca o espaço associado ao email do usuário
    const espaco = await prisma.espaco.findFirst({
      where: {
        email: userEmail
      }
    })

    if (!espaco) {
      return NextResponse.json(
        { error: 'Espaço não encontrado para este usuário' },
        { status: 404 }
      )
    }

    console.log('Buscando mensagens para o espaço:', espaco.id)

    // Busca todas as mensagens do espaço
    const mensagens = await prisma.mensagem.findMany({
      where: {
        espacoId: espaco.id
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true
          }
        },
        respostas: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Encontradas ${mensagens.length} mensagens para o espaço ${espaco.id}`)
    
    // Calcular estatísticas
    const totalMensagens = mensagens.length
    const naoRespondidas = mensagens.filter(m => {
      try {
        return !m.respostas || m.respostas.length === 0
      } catch (error) {
        console.error('Erro ao verificar respostas:', error)
        return true
      }
    }).length
    
    const mensagensHoje = mensagens.filter(m => {
      const hoje = new Date()
      const dataMensagem = new Date(m.createdAt)
      return dataMensagem.getDate() === hoje.getDate() &&
             dataMensagem.getMonth() === hoje.getMonth() &&
             dataMensagem.getFullYear() === hoje.getFullYear()
    }).length
    
    // Tempo médio de resposta (em horas)
    // Calcularemos isso se tivermos implementado as respostas com timestamps

    // Retorna os dados e estatísticas
    return NextResponse.json({
      mensagens,
      estatisticas: {
        totalMensagens,
        naoRespondidas,
        mensagensHoje
      }
    })

  } catch (error) {
    console.error('Erro ao buscar mensagens do espaço:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar mensagens' },
      { status: 500 }
    )
  }
}
