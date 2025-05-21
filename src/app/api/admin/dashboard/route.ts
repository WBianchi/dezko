import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar estatísticas gerais
    const [
      totalUsers,
      totalSpaces,
      totalBookings,
      totalRevenue,
      recentBookings,
      recentSpaces
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.espaco.count(),
      prisma.pedido.count(),
      prisma.pedido.aggregate({
        _sum: {
          valor: true
        },
        where: {
          statusPedido: 'PAGO'
        }
      }),
      prisma.pedido.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          usuario: true,
          espaco: true,
          plano: true
        }
      }),
      prisma.espaco.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          _count: {
            select: {
              pedidos: true,
              avaliacoes: true
            }
          }
        }
      })
    ])

    // Calcular crescimento mensal
    const lastMonthStart = new Date()
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
    lastMonthStart.setDate(1)
    
    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)

    const [lastMonthUsers, thisMonthUsers] = await Promise.all([
      prisma.usuario.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lt: thisMonthStart
          }
        }
      }),
      prisma.usuario.count({
        where: {
          createdAt: {
            gte: thisMonthStart
          }
        }
      })
    ])

    const userGrowth = lastMonthUsers > 0 
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 
      : 0

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSpaces,
        totalBookings,
        totalRevenue: totalRevenue._sum.valor || 0,
        userGrowth
      },
      recentBookings,
      recentSpaces
    })
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 }
    )
  }
}
