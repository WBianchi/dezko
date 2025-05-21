import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await getServerSession(auth)

    if (!session || !session.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const pagamentos = await prisma.pedido.findMany({
      select: {
        id: true,
        createdAt: true,
        dataInicio: true,
        valor: true,
        statusPedido: true,
        formaPagamento: true,

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

    return NextResponse.json({ pagamentos })
  } catch (error) {
    console.error('[PAGAMENTOS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
