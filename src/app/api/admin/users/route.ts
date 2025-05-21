import { prisma } from '@/lib/prisma'
import * as argon2 from 'argon2'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Buscar todos os usuários (admin, espaço e usuário)
    const [admins, espacos, usuarios] = await Promise.all([
      prisma.admin.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          createdAt: true,
        },
      }),
      prisma.espaco.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          createdAt: true
        },
      }),
      prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          createdAt: true,
        },
      }),
    ])

    // Adicionar o campo role em cada usuário
    const allUsers = [
      ...admins.map(admin => ({ ...admin, role: 'admin' })),
      ...espacos.map(espaco => ({ 
        ...espaco, 
        role: 'espaco' 
      })),
      ...usuarios.map(usuario => ({ ...usuario, role: 'usuario' })),
    ]

    // Ordenar por data de criação (mais recente primeiro)
    allUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return NextResponse.json(allUsers)
  } catch (error) {
    console.error('[USERS_GET]', error)
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
    const { nome, email, senha, role } = body

    // Hash da senha
    const hashedPassword = await argon2.hash(senha)

    let user

    // Criar usuário de acordo com o role
    if (role === 'admin') {
      user = await prisma.admin.create({
        data: {
          nome,
          email,
          senha: hashedPassword,
        },
      })
    } else if (role === 'espaco') {
      // Buscar um admin para associar
      const admin = await prisma.admin.findFirst()
      
      if (!admin) {
        return new NextResponse('Admin não encontrado', { status: 404 })
      }
      
      user = await prisma.espaco.create({
        data: {
          nome,
          email,
          senha: hashedPassword,
          status: "aprovado",
          admin: {
            connect: {
              id: admin.id
            }
          }
        },
      })
    } else {
      user = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: hashedPassword,
        },
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('[USERS_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return new NextResponse('ID não fornecido', { status: 400 })
    }

    const body = await req.json()
    const { nome, email, senha, role } = body

    let updateData: any = {
      nome,
      email,
    }

    // Se uma nova senha foi fornecida, hash ela
    if (senha) {
      updateData.senha = await argon2.hash(senha)
    }

    let user

    // Atualizar usuário de acordo com o role
    if (role === 'admin') {
      user = await prisma.admin.update({
        where: { id },
        data: updateData,
      })
    } else if (role === 'espaco') {
      user = await prisma.espaco.update({
        where: { id },
        data: updateData,
      })
    } else {
      user = await prisma.usuario.update({
        where: { id },
        data: updateData,
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('[USERS_PUT]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return new NextResponse('ID não fornecido', { status: 400 })
    }

    // Tentar excluir de todas as tabelas
    await Promise.all([
      prisma.admin.deleteMany({ where: { id } }),
      prisma.espaco.deleteMany({ where: { id } }),
      prisma.usuario.deleteMany({ where: { id } }),
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[USERS_DELETE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
