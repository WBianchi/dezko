import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return new NextResponse('Slug não fornecido', { status: 400 })
    }

    // Buscar post pelo slug
    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
        status: 'PUBLICADO' // Apenas posts publicados
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
        },
        postsRelacionados: {
          where: {
            status: 'PUBLICADO'
          },
          select: {
            id: true,
            titulo: true,
            slug: true,
            foto: true,
            descricao: true
          },
          take: 3
        }
      }
    })

    if (!post) {
      return new NextResponse('Post não encontrado', { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('[BLOG_GET_BY_SLUG]', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}
