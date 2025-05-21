import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Tipagem personalizada do usuário NextAuth
interface UserWithRole {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
  role?: string;
}

// Função auxiliar para obter o ID do espaço
async function getEspacoId(session: any) {
  const user = session.user as UserWithRole;
  const userRole = user.role;
  
  if (userRole === "espaco" && user.id) {
    return user.id;
  } else if (userRole === "admin") {
    const admin = await prisma.admin.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        espacos: {
          select: {
            id: true
          },
          take: 1
        }
      }
    });

    if (!admin || admin.espacos.length === 0) {
      return null;
    }

    return admin.espacos[0].id;
  }
  
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const espacoId = await getEspacoId(session);

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Buscar o espaço com suas categorias
    const espaco = await prisma.espaco.findUnique({
      where: {
        id: espacoId
      },
      include: {
        categorias: true
      }
    });

    if (!espaco) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Buscar todas as categorias disponíveis para seleção
    const todasCategorias = await prisma.categoriaEspaco.findMany({
      orderBy: {
        nome: "asc"
      }
    });

    return NextResponse.json({
      categoriasDoEspaco: espaco.categorias,
      todasCategorias
    });
  } catch (error) {
    console.error("[CATEGORIAS_ESPACO_GET]", error);
    return new NextResponse("Erro ao buscar categorias do espaço", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const body = await req.json();
    const { categoriaId } = body;
    
    const espacoId = await getEspacoId(session);

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Validações
    if (!categoriaId) {
      return new NextResponse("ID da categoria é obrigatório", { status: 400 });
    }

    // Verificar se a categoria existe
    const categoria = await prisma.categoriaEspaco.findUnique({
      where: {
        id: categoriaId
      }
    });

    if (!categoria) {
      return new NextResponse("Categoria não encontrada", { status: 404 });
    }

    // Verificar se o espaço já possui essa categoria
    const espaco = await prisma.espaco.findUnique({
      where: {
        id: espacoId
      },
      include: {
        categorias: {
          where: {
            id: categoriaId
          }
        }
      }
    });

    if (espaco?.categorias.length > 0) {
      return new NextResponse("O espaço já possui essa categoria", { status: 400 });
    }

    // Adicionar a categoria ao espaço
    const espacoAtualizado = await prisma.espaco.update({
      where: {
        id: espacoId
      },
      data: {
        categorias: {
          connect: {
            id: categoriaId
          }
        }
      },
      include: {
        categorias: true
      }
    });

    return NextResponse.json(espacoAtualizado);
  } catch (error) {
    console.error("[CATEGORIAS_ESPACO_POST]", error);
    return new NextResponse("Erro ao adicionar categoria ao espaço", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const categoriaId = searchParams.get("id");

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  if (!categoriaId) {
    return new NextResponse("ID da categoria não fornecido", { status: 400 });
  }

  try {
    const espacoId = await getEspacoId(session);

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Verificar se o espaço possui essa categoria
    const espaco = await prisma.espaco.findUnique({
      where: {
        id: espacoId
      },
      include: {
        categorias: {
          where: {
            id: categoriaId
          }
        }
      }
    });

    if (!espaco || espaco.categorias.length === 0) {
      return new NextResponse("O espaço não possui essa categoria", { status: 404 });
    }

    // Remover a categoria do espaço
    const espacoAtualizado = await prisma.espaco.update({
      where: {
        id: espacoId
      },
      data: {
        categorias: {
          disconnect: {
            id: categoriaId
          }
        }
      },
      include: {
        categorias: true
      }
    });

    return NextResponse.json(espacoAtualizado);
  } catch (error) {
    console.error("[CATEGORIAS_ESPACO_DELETE]", error);
    return new NextResponse("Erro ao remover categoria do espaço", { status: 500 });
  }
}
