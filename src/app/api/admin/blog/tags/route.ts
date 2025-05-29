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

    const tags = await db.blogTag.findMany({
      orderBy: {
        nome: 'asc'
      }
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('[TAGS_GET]', error)
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

    const tag = await db.blogTag.create({
      data: {
        nome
      }
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('[TAGS_POST]', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}
