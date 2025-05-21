import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para validar o avatar
const avatarSchema = z.object({
  avatar: z.string().startsWith('data:image/', 'Avatar deve ser uma imagem em base64')
})

/**
 * POST: Atualiza o avatar do usuário autenticado
 */
export async function POST(request: NextRequest) {
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

    // Obtém e valida os dados enviados pelo cliente
    const body = await request.json()
    
    try {
      avatarSchema.parse(body)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: validationError.format() },
          { status: 400 }
        )
      }
    }

    // Verifica se o usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: userEmail },
    })

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Atualiza o avatar do usuário no banco de dados
    const usuarioAtualizado = await prisma.usuario.update({
      where: { email: userEmail },
      data: {
        avatar: body.avatar,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        avatar: true,
        updatedAt: true,
      },
    })

    // Retorna os dados atualizados
    return NextResponse.json({
      message: 'Avatar atualizado com sucesso',
      avatar: usuarioAtualizado.avatar
    })

  } catch (error) {
    console.error('Erro ao atualizar avatar:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar avatar' },
      { status: 500 }
    )
  }
}
