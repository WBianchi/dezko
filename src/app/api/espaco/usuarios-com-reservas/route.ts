import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET: Busca todos os usuários que fizeram reservas neste espaço
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
    const userEmail = session.user.email
    
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado na sessão' },
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

    console.log('Buscando usuários com reservas para o espaço:', espaco.id)

    // Busca todos os usuários distintos que fizeram reservas neste espaço
    const reservas = await prisma.reservation.findMany({
      where: {
        espacoId: espaco.id
      },
      select: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      distinct: ['userId']
    })

    // Extrai os usuários únicos das reservas
    const usuarios = reservas
      .map(r => r.usuario)
      .filter((usuario): usuario is { id: string; nome: string; email: string | null } => 
        usuario !== null
      )
    
    console.log(`Encontrados ${usuarios.length} usuários com reservas no espaço ${espaco.id}`)

    return NextResponse.json({ usuarios })

  } catch (error) {
    console.error('Erro ao buscar usuários do espaço:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    )
  }
}
