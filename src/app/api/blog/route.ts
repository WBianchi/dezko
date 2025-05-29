import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar posts publicados com categorias, tags e autor
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLICADO'
      },
      include: {
        autor: {
          select: {
            nome: true
          }
        },
        categorias: {
          select: {
            id: true,
            nome: true,
            slug: true
          }
        },
        tags: {
          select: {
            id: true,
            nome: true,
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
