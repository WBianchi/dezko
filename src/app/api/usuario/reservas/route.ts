import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, ReservationStatus } from '@prisma/client'

/**
 * GET: Busca todas as reservas do usuário autenticado
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
    const userId = session.user.id as string
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado na sessão' },
        { status: 400 }
      )
    }

    console.log('Buscando reservas para o usuário:', userId)

    // Busca todas as reservas do usuário
    const reservas = await prisma.reservation.findMany({
      where: {
        userId: userId
      },
      include: {
        espaco: true,
        pagamentos: true,
        agenda: true,
        plano: true,
        usuario: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Encontradas ${reservas.length} reservas para o usuário ${userId}`)
    
    // Calcular estatísticas
    const totalReservas = reservas.length
    const reservasConfirmadas = reservas.filter(r => r.status === ReservationStatus.PAGO).length
    const valorTotal = reservas.reduce((total, r) => total + r.valor, 0)
    
    // Formatar os dados para retorno
    const reservasFormatadas = reservas.map(reserva => {
      return {
        id: reserva.id,
        dataInicio: reserva.dataInicio,
        dataFim: reserva.dataFim,
        status: reserva.status,
        valor: reserva.valor,
        espacoId: reserva.espacoId,
        espaco: reserva.espaco,
        agendaId: reserva.agendaId,
        agenda: reserva.agenda,
        pagamentos: reserva.pagamentos,
        createdAt: reserva.createdAt,
        updatedAt: reserva.updatedAt
      }
    })

    // Retorna os dados e estatísticas
    return NextResponse.json({
      reservas: reservasFormatadas,
      estatisticas: {
        totalReservas,
        reservasConfirmadas,
        valorTotal
      }
    })

  } catch (error) {
    console.error('Erro ao buscar reservas do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar reservas' },
      { status: 500 }
    )
  }
}
