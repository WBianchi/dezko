import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const reservas = await prisma.pedido.findMany({
      select: {
        id: true,
        createdAt: true,
        dataInicio: true,
        dataFim: true,
        statusPedido: true,
        valor: true,
        usuario: {
          select: {
            nome: true,
            email: true,
          },
        },
        espaco: {
          select: {
            nome: true,
          },
        },
        plano: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reservas)
  } catch (error) {
    console.error('[RESERVAS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
