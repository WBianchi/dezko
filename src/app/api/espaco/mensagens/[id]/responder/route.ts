import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/**
 * POST: Responde a uma mensagem de um usuário
 */
export async function POST(
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

    // Obtém o id da mensagem
    const mensagemId = params?.id?.toString()
    
    if (!mensagemId) {
      return NextResponse.json(
        { error: 'ID da mensagem não fornecido' },
        { status: 400 }
      )
    }

    // Obtém o conteúdo da resposta
    const { resposta } = await request.json()
    
    if (!resposta) {
      return NextResponse.json(
        { error: 'Conteúdo da resposta não fornecido' },
        { status: 400 }
      )
    }

    // Verifica se a mensagem existe e pertence ao espaço
    const mensagem = await prisma.mensagem.findFirst({
      where: { 
        id: mensagemId,
        espacoId: espaco.id
      }
    })

    if (!mensagem) {
      return NextResponse.json(
        { error: 'Mensagem não encontrada ou não pertence ao espaço' },
        { status: 404 }
      )
    }

    // Criamos a resposta usando SQL raw para evitar problemas com o Prisma
    const novaResposta = await prisma.$executeRaw`
      INSERT INTO "Resposta" (id, "createdAt", "updatedAt", mensagem, "mensagemId")
      VALUES (${crypto.randomUUID()}, NOW(), NOW(), ${resposta}, ${mensagemId})
      RETURNING *
    `
    
    // Depois atualizamos a mensagem marcando como lida
    await prisma.$executeRaw`
      UPDATE "Mensagem"
      SET lida = true, "updatedAt" = NOW()
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
    console.error('Erro ao responder mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    )
  }
}
