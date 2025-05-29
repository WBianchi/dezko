import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    const categorias = await db.categoriaBlog.findMany({
      orderBy: {
        nome: 'asc'
      }
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error('[CATEGORIAS_GET]', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    const body = await req.json()
    const { nome } = body

    if (!nome) {
      return new NextResponse('Nome é obrigatório', { status: 400 })
    }

    const categoria = await db.categoriaBlog.create({
      data: {
        nome
      }
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('[CATEGORIAS_POST]', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}
