import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * GET: Busca todos os pagamentos do usuário autenticado
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

    console.log('Buscando pagamentos para o usuário:', userId)

    // Busca as reservas do usuário e seus pagamentos relacionados
    const reservas = await prisma.reservation.findMany({
      where: {
        userId: userId
      },
      include: {
        pagamentos: true,
        espaco: true,
        agenda: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Extrair todos os pagamentos de todas as reservas
    const pagamentos = reservas.flatMap(reserva => reserva.pagamentos || [])
    
    console.log(`Encontrados ${pagamentos.length} pagamentos para o usuário ${userId}`)
    
    // Calcular estatísticas
    const totalPagamentos = pagamentos.length
    const pagamentosConcluidos = pagamentos.filter(p => 
      p.status === 'approved' || p.status === 'pago'
    ).length
    const valorTotal = pagamentos.reduce((total, p) => total + p.valor, 0)
    
    // Formatar os dados para retorno
    const pagamentosFormatados = pagamentos.map(pagamento => {
      // Encontrar a reserva associada a este pagamento
      const reserva = reservas.find(r => r.id === pagamento.reservaId)
      
      return {
        id: pagamento.id,
        valor: pagamento.valor,
        status: pagamento.status,
        gateway: pagamento.gateway,
        gatewayId: pagamento.gatewayId,
        dataPagamento: pagamento.updatedAt,
        reserva: reserva ? {
          id: reserva.id,
          dataInicio: reserva.dataInicio,
          dataFim: reserva.dataFim,
          tipoReserva: reserva.agenda?.tipoReserva || 'Avulsa',
          espaco: reserva.espaco
        } : null,
        createdAt: pagamento.createdAt,
        updatedAt: pagamento.updatedAt
      }
    })

    // Retorna os dados e estatísticas
    return NextResponse.json({
      pagamentos: pagamentosFormatados,
      estatisticas: {
        totalPagamentos,
        pagamentosConcluidos,
        valorTotal
      }
    })

  } catch (error) {
    console.error('Erro ao buscar pagamentos do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pagamentos' },
      { status: 500 }
    )
  }
}
