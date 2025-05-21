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

    const beneficios = await prisma.beneficios.findMany({
      where: {
        espacoId: espacoId
      },
      orderBy: {
        nome: "asc"
      }
    });

    return NextResponse.json(beneficios);
  } catch (error) {
    console.error("[BENEFICIOS_GET]", error);
    return new NextResponse("Erro ao buscar beneficios", { status: 500 });
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

    // Verificar se já existe esse benefício para o espaço
    const beneficioExistente = await prisma.beneficios.findFirst({
      where: {
        espacoId,
        nome
      }
    });

    if (beneficioExistente) {
      return new NextResponse("Esse benefício já existe", { status: 400 });
    }

    const beneficio = await prisma.beneficios.create({
      data: {
        nome,
        espaco: {
          connect: {
            id: espacoId
          }
        }
      }
    });

    return NextResponse.json(beneficio);
  } catch (error) {
    console.error("[BENEFICIOS_POST]", error);
    return new NextResponse("Erro ao criar benefício", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const beneficioId = searchParams.get("id");

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  if (!beneficioId) {
    return new NextResponse("ID do benefício não fornecido", { status: 400 });
  }

  try {
    const espacoId = await getEspacoId(session);

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Verificar se o benefício pertence ao espaço
    const beneficio = await prisma.beneficios.findUnique({
      where: {
        id: beneficioId
      }
    });

    if (!beneficio || beneficio.espacoId !== espacoId) {
      return new NextResponse("Benefício não encontrado ou não pertence ao espaço", { status: 404 });
    }

    await prisma.beneficios.delete({
      where: {
        id: beneficioId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BENEFICIOS_DELETE]", error);
    return new NextResponse("Erro ao deletar benefício", { status: 500 });
  }
}
