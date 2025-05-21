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

    const configuracoes = await prisma.configuracao.findFirst()
    return NextResponse.json(configuracoes)
  } catch (error) {
    console.error('[CONFIGURACOES_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { nomeSite, descricaoSite, emailContato, telefoneContato, enderecoEmpresa } = body

    const configuracoes = await prisma.configuracao.upsert({
      where: {
        id: '1', // Sempre teremos apenas uma configuração
      },
      update: {
        nomeSite,
        descricaoSite,
        emailContato,
        telefoneContato,
        enderecoEmpresa,
      },
      create: {
        id: '1',
        nomeSite,
        descricaoSite,
        emailContato,
        telefoneContato,
        enderecoEmpresa,
      },
    })

    return NextResponse.json(configuracoes)
  } catch (error) {
    console.error('[CONFIGURACOES_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
