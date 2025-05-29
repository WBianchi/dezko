import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    // Buscar todos os posts com categorias e tags
    const posts = await prisma.blogPost.findMany({
      include: {
        autor: {
          select: {
            nome: true
          }
        },
        categorias: {
          select: {
            id: true,
            nome: true
          }
        },
        tags: {
          select: {
            id: true,
            nome: true
          }
        },
        postsRelacionados: {
          select: {
            id: true,
            titulo: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('[BLOG_GET]', error)
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
    const { 
      titulo, 
      slug, 
      descricao, 
      conteudo, 
      foto, 
      status,
      categoriaIds = [],
      tagIds = [],
      postsRelacionadosIds = []
    } = body

    if (!titulo || !slug || !conteudo) {
      return new NextResponse('Faltam campos obrigatórios', { status: 400 })
    }

    // Verificar se o slug já existe
    const existingPost = await prisma.blogPost.findUnique({
      where: {
        slug
      }
    })

    if (existingPost) {
      return new NextResponse('Slug já está em uso', { status: 400 })
    }

    // Verificar se o admin já tem um usuário correspondente
    let autorId = session.user.id;
    
    if (session.user.role === 'admin') {
      // Verifica se existe um usuário com o mesmo email do admin
      const usuario = await prisma.usuario.findUnique({
        where: { email: session.user.email }
      });
      
      if (usuario) {
        // Se existir, usa o ID desse usuário
        autorId = usuario.id;
      } else {
        // Se não existir, cria um novo usuário para o admin
        const novoUsuario = await prisma.usuario.create({
          data: {
            nome: session.user.name || 'Admin',
            email: session.user.email || '',
            senha: 'senha-hash-não-utilizada-para-login-de-admin' // Este usuário é apenas para referência
          }
        });
        autorId = novoUsuario.id;
      }
    }
    
    // Criar o post
    const post = await prisma.blogPost.create({
      data: {
        titulo,
        slug,
        descricao,
        conteudo,
        foto,
        status,
        autorId: autorId,
        pontuacaoSeo: 0, // Valor padrão, será calculado automaticamente em outro processo
        // Conectar categorias
        categorias: {
          connect: categoriaIds.map((id: string) => ({ id }))
        },
        // Conectar tags
        tags: {
          connect: tagIds.map((id: string) => ({ id }))
        },
        // Conectar posts relacionados
        postsRelacionados: {
          connect: postsRelacionadosIds.map((id: string) => ({ id }))
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('[BLOG_POST]', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}
