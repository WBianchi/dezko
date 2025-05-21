import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST: Cria uma nova mensagem do usuário para um espaço
 */
export async function POST(request: Request) {
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

    // Obtém os dados da mensagem
    const { assunto, mensagem, espacoId } = await request.json()
    
    // Valida os dados
    if (!assunto || !mensagem || !espacoId) {
      return NextResponse.json(
        { error: 'Dados incompletos. Assunto, mensagem e espaço são obrigatórios.' },
        { status: 400 }
      )
    }

    // Verifica se o espaço existe
    const espaco = await prisma.espaco.findUnique({
      where: { id: espacoId }
    })

    if (!espaco) {
      return NextResponse.json(
        { error: 'Espaço não encontrado' },
        { status: 404 }
      )
    }

    // Cria a mensagem
    const novaMensagem = await prisma.mensagem.create({
      data: {
        assunto,
        mensagem,
        espacoId,
        usuarioId: userId,
      }
    })

    return NextResponse.json(
      { success: true, mensagem: novaMensagem },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro ao criar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao criar mensagem' },
      { status: 500 }
    )
  }
}
