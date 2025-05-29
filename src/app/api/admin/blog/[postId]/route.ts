import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Buscar um post específico
export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    if (!params.postId) {
      return new NextResponse('ID do post é necessário', { status: 400 })
    }

    const post = await db.blogPost.findUnique({
      where: {
        id: params.postId,
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
      }
    })

    if (!post) {
      return new NextResponse('Post não encontrado', { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('[POST_GET]', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}

// PATCH - Atualizar um post
export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
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

    if (!params.postId) {
      return new NextResponse('ID do post é necessário', { status: 400 })
    }

    if (!titulo || !slug || !conteudo) {
      return new NextResponse('Faltam campos obrigatórios', { status: 400 })
    }

    // Verificar se o post existe
    const existingPost = await db.blogPost.findUnique({
      where: {
        id: params.postId,
      }
    })

    if (!existingPost) {
      return new NextResponse('Post não encontrado', { status: 404 })
    }

    // Verificar se o slug já existe em outro post
    if (slug !== existingPost.slug) {
      const slugExists = await db.blogPost.findUnique({
        where: {
          slug,
          NOT: {
            id: params.postId
          }
        }
      })

      if (slugExists) {
        return new NextResponse('Slug já está em uso', { status: 400 })
      }
    }

    // Atualizar o post
    // Primeiro, desconectar todos os relacionamentos existentes
    await db.blogPost.update({
      where: {
        id: params.postId,
      },
      data: {
        categorias: {
          set: []
        },
        tags: {
          set: []
        },
        postsRelacionados: {
          set: []
        }
      }
    })

    // Depois, atualizar o post com os novos dados e relacionamentos
    const updatedPost = await db.blogPost.update({
      where: {
        id: params.postId,
      },
      data: {
        titulo,
        slug,
        descricao,
        conteudo,
        foto,
        status,
        categorias: {
          connect: categoriaIds.map((id: string) => ({ id }))
        },
        tags: {
          connect: tagIds.map((id: string) => ({ id }))
        },
        postsRelacionados: {
          connect: postsRelacionadosIds.map((id: string) => ({ id }))
        }
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
            titulo: true
          }
        }
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('[POST_PATCH]', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}

// DELETE - Excluir um post
export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    if (!params.postId) {
      return new NextResponse('ID do post é necessário', { status: 400 })
    }

    // Verificar se o post existe
    const post = await db.blogPost.findUnique({
      where: {
        id: params.postId,
      }
    })

    if (!post) {
      return new NextResponse('Post não encontrado', { status: 404 })
    }

    // Primeiramente, remover todas as relações
    await db.blogPost.update({
      where: {
        id: params.postId,
      },
      data: {
        categorias: {
          set: []
        },
        tags: {
          set: []
        },
        postsRelacionados: {
          set: []
        },
        relacionadoCom: {
          set: []
        }
      }
    })

    // Excluir o post
    await db.blogPost.delete({
      where: {
        id: params.postId,
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[POST_DELETE]', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}
