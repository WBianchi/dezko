import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET: Busca todos os espaços onde o usuário tem reservas
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

    console.log('Buscando espaços reservados pelo usuário:', userId)

    // Busca todas as reservas do usuário
    const reservas = await prisma.reservation.findMany({
      where: {
        userId: userId
      },
      select: {
        espaco: {
          select: {
            id: true,
            nome: true,
            cidade: true,
            estado: true,
            fotoPrincipal: true
          }
        }
      },
      distinct: ['espacoId']
    })

    // Extrai os espaços únicos das reservas
    const espacos = reservas
      .map(r => r.espaco)
      .filter(espaco => espaco !== null)
    
    console.log(`Encontrados ${espacos.length} espaços reservados pelo usuário ${userId}`)

    return NextResponse.json({ espacos })

  } catch (error) {
    console.error('Erro ao buscar espaços do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar espaços' },
      { status: 500 }
    )
  }
}
