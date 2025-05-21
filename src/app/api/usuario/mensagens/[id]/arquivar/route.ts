import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH: Arquiva uma mensagem
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id?: string } }
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

    // Obtém o id do usuário da sessão
    const userId = session.user.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado na sessão' },
        { status: 400 }
      )
    }

    // Obtém o id da mensagem
    const mensagemId = params?.id?.toString()
    
    if (!mensagemId) {
      return NextResponse.json(
        { error: 'ID da mensagem não fornecido' },
        { status: 400 }
      )
    }

    // Verifica se a mensagem existe e pertence ao usuário
    const mensagem = await prisma.mensagem.findFirst({
      where: { 
        id: mensagemId,
        usuarioId: userId
      }
    })

    if (!mensagem) {
      return NextResponse.json(
        { error: 'Mensagem não encontrada ou não pertence ao usuário' },
        { status: 404 }
      )
    }

    // Atualiza a mensagem como arquivada usando SQL raw para evitar problemas com o Prisma
    await prisma.$executeRaw`
      UPDATE "Mensagem"
      SET arquivada = true, "updatedAt" = NOW()
      WHERE id = ${mensagemId}
    `
    
    // Busca a mensagem atualizada
    const mensagemAtualizada = await prisma.mensagem.findUnique({
      where: { id: mensagemId }
    })

    return NextResponse.json({ 
      success: true, 
      mensagem: mensagemAtualizada 
    })

  } catch (error) {
    console.error('Erro ao arquivar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    )
  }
}
