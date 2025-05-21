import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcrypt'

// Schema para validar a atualização de senha
const senhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
  novaSenha: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Confirme a nova senha'),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha']
})

/**
 * PUT: Atualiza a senha do usuário autenticado
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
      senhaSchema.parse(body)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: validationError.format() },
          { status: 400 }
        )
      }
    }

    // Busca o usuário no banco de dados
    const usuario = await prisma.usuario.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        senha: true,
      },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verifica se a senha atual está correta
    const senhaCorreta = await bcrypt.compare(body.senhaAtual, usuario.senha)
    
    if (!senhaCorreta) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 400 }
      )
    }

    // Gera o hash da nova senha
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(body.novaSenha, salt)

    // Atualiza a senha do usuário no banco de dados
    await prisma.usuario.update({
      where: { email: userEmail },
      data: {
        senha: hashedPassword,
      },
    })

    // Retorna sucesso
    return NextResponse.json({
      message: 'Senha atualizada com sucesso',
    })

  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar senha' },
      { status: 500 }
    )
  }
}
