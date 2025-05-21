import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para validar a atualização do perfil
const perfilSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF é obrigatório e deve ter 11 dígitos').max(14, 'CPF deve ter no máximo 14 caracteres'),
  telefone: z.string().min(14, 'Telefone é obrigatório e deve estar no formato (99) 99999-9999'),
})

/**
 * GET: Busca os dados do perfil do usuário autenticado
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

    // Busca os dados do usuário no banco de dados
    const usuario = await prisma.usuario.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        nome: true,
        email: true,
        avatar: true,
        cpf: true,
        telefone: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Retorna os dados do usuário
    return NextResponse.json(usuario)

  } catch (error) {
    console.error('Erro ao buscar dados do perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do perfil' },
      { status: 500 }
    )
  }
}

/**
 * PUT: Atualiza os dados do perfil do usuário autenticado
 */
export async function PUT(request: NextRequest) {
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
      perfilSchema.parse(body)
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

    // Verifica se o email está sendo alterado (não permitido)
    if (body.email !== userEmail) {
      return NextResponse.json(
        { error: 'Não é permitido alterar o email' },
        { status: 400 }
      )
    }

    // Atualiza os dados do usuário no banco de dados
    const usuarioAtualizado = await prisma.usuario.update({
      where: { email: userEmail },
      data: {
        nome: body.nome,
        cpf: body.cpf,
        telefone: body.telefone,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        avatar: true,
        cpf: true,
        telefone: true,
        updatedAt: true,
      },
    })

    // Retorna os dados atualizados
    return NextResponse.json(usuarioAtualizado)

  } catch (error) {
    console.error('Erro ao atualizar dados do perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar dados do perfil' },
      { status: 500 }
    )
  }
}
