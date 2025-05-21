import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { addMonths, subMonths, startOfMonth } from 'date-fns'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Dados dos últimos 6 meses
    const dataInicial = subMonths(startOfMonth(new Date()), 5)
    const dataFinal = addMonths(startOfMonth(new Date()), 1)

    // Vendas por mês
    const vendasPorMes = await prisma.pedido.groupBy({
      by: ['createdAt'],
      _sum: {
        valor: true,
      },
      where: {
        createdAt: {
          gte: dataInicial,
          lt: dataFinal,
        },
        statusPedido: 'PAGO',
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Total de vendas
    const totalVendas = await prisma.pedido.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        statusPedido: 'PAGO',
      },
    })

    // Total de espaços
    const totalEspacos = await prisma.espaco.count()

    // Total de usuários
    const totalUsuarios = await prisma.usuario.count()

    // Crescimento de usuários nos últimos 30 dias
    const crescimentoUsuarios = await prisma.usuario.groupBy({
      by: ['createdAt'],
      _count: true,
      orderBy: {
        createdAt: 'asc',
      },
      where: {
        createdAt: {
          gte: subMonths(new Date(), 1),
        },
      },
    })

    // Formatar dados para os gráficos
    const dadosVendas = vendasPorMes.map((mes) => ({
      mes: mes.createdAt,
      valor: mes._sum.valor || 0,
    }))

    const dadosUsuarios = crescimentoUsuarios.map((dia) => ({
      data: dia.createdAt,
      quantidade: dia._count,
    }))

    // Dados mockados para distribuição de espaços
    const espacosPorCategoria = [
      { categoria: 'Coworking', quantidade: 15 },
      { categoria: 'Sala de Reunião', quantidade: 8 },
      { categoria: 'Auditório', quantidade: 5 },
      { categoria: 'Estúdio', quantidade: 7 },
      { categoria: 'Outros', quantidade: 3 },
    ]

    return NextResponse.json({
      vendasPorMes: dadosVendas,
      totalVendas: totalVendas._sum.valor || 0,
      totalEspacos,
      totalUsuarios,
      crescimentoUsuarios: dadosUsuarios,
      espacosPorCategoria,
    })
  } catch (error) {
    console.error('[RELATORIOS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
