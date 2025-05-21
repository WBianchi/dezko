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

    const vantagens = await prisma.vantagens.findMany({
      where: {
        espacoId: espacoId
      },
      orderBy: {
        nome: "asc"
      }
    });

    return NextResponse.json(vantagens);
  } catch (error) {
    console.error("[VANTAGENS_GET]", error);
    return new NextResponse("Erro ao buscar vantagens", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const body = await req.json();
    const { nome } = body;
    
    const espacoId = await getEspacoId(session);

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Validações
    if (!nome) {
      return new NextResponse("Nome é obrigatório", { status: 400 });
    }

    // Verificar se já existe essa vantagem para o espaço
    const vantagemExistente = await prisma.vantagens.findFirst({
      where: {
        espacoId,
        nome
      }
    });

    if (vantagemExistente) {
      return new NextResponse("Essa vantagem já existe", { status: 400 });
    }

    const vantagem = await prisma.vantagens.create({
      data: {
        nome,
        espaco: {
          connect: {
            id: espacoId
          }
        }
      }
    });

    return NextResponse.json(vantagem);
  } catch (error) {
    console.error("[VANTAGENS_POST]", error);
    return new NextResponse("Erro ao criar vantagem", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const vantagemId = searchParams.get("id");

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  if (!vantagemId) {
    return new NextResponse("ID da vantagem não fornecido", { status: 400 });
  }

  try {
    const espacoId = await getEspacoId(session);

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Verificar se a vantagem pertence ao espaço
    const vantagem = await prisma.vantagens.findUnique({
      where: {
        id: vantagemId
      }
    });

    if (!vantagem || vantagem.espacoId !== espacoId) {
      return new NextResponse("Vantagem não encontrada ou não pertence ao espaço", { status: 404 });
    }

    await prisma.vantagens.delete({
      where: {
        id: vantagemId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[VANTAGENS_DELETE]", error);
    return new NextResponse("Erro ao deletar vantagem", { status: 500 });
  }
}
