import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST: Cria uma nova mensagem do espaço para um usuário
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

    // Obtém o id do usuário e email da sessão
    const userEmail = session.user.email
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email do usuário não encontrado na sessão' },
        { status: 400 }
      )
    }

    // Verifica se o usuário é dono de um espaço
    const espaco = await prisma.espaco.findFirst({
      where: {
        email: userEmail
      }
    })

    if (!espaco) {
      return NextResponse.json(
        { error: 'Você não possui um espaço cadastrado' },
        { status: 404 }
      )
    }

    // Obtém os dados da mensagem
    const { assunto, mensagem, usuarioId } = await request.json()
    
    // Valida os dados
    if (!assunto || !mensagem || !usuarioId) {
      return NextResponse.json(
        { error: 'Dados incompletos. Assunto, mensagem e usuário são obrigatórios.' },
        { status: 400 }
      )
    }

    // Verifica se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Cria a mensagem
    const novaMensagem = await prisma.mensagem.create({
      data: {
        assunto,
        mensagem,
        espacoId: espaco.id,
        usuarioId,
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
