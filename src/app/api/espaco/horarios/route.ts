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

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const user = session.user as UserWithRole;
    const userRole = user.role;
    let espacoId: string | null = null;

    if (userRole === "espaco" && user.id) {
      espacoId = user.id;
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
        return new NextResponse("Espaço não encontrado", { status: 404 });
      }

      espacoId = admin.espacos[0].id;
    }

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    const horarios = await prisma.horarios.findMany({
      where: {
        espacoId: espacoId
      },
      orderBy: {
        diaSemana: "asc"
      }
    });

    return NextResponse.json(horarios);
  } catch (error) {
    console.error("[HORARIOS_GET]", error);
    return new NextResponse("Erro ao buscar horários", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const body = await req.json();
    const { diaSemana, horaInicio, horaFim } = body;
    
    const user = session.user as UserWithRole;
    const userRole = user.role;
    let espacoId: string | null = null;

    if (userRole === "espaco" && user.id) {
      espacoId = user.id;
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
        return new NextResponse("Espaço não encontrado", { status: 404 });
      }

      espacoId = admin.espacos[0].id;
    }

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Validações
    if (!diaSemana || !horaInicio || !horaFim) {
      return new NextResponse("Dados incompletos", { status: 400 });
    }

    const horario = await prisma.horarios.create({
      data: {
        diaSemana,
        horaInicio,
        horaFim,
        espaco: {
          connect: {
            id: espacoId
          }
        }
      }
    });

    return NextResponse.json(horario);
  } catch (error) {
    console.error("[HORARIOS_POST]", error);
    return new NextResponse("Erro ao criar horário", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const horarioId = searchParams.get("id");

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  if (!horarioId) {
    return new NextResponse("ID do horário não fornecido", { status: 400 });
  }

  try {
    const user = session.user as UserWithRole;
    const userRole = user.role;
    let espacoId: string | null = null;

    if (userRole === "espaco" && user.id) {
      espacoId = user.id;
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
        return new NextResponse("Espaço não encontrado", { status: 404 });
      }

      espacoId = admin.espacos[0].id;
    }

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Verificar se o horário pertence ao espaço
    const horario = await prisma.horarios.findUnique({
      where: {
        id: horarioId
      }
    });

    if (!horario || horario.espacoId !== espacoId) {
      return new NextResponse("Horário não encontrado ou não pertence ao espaço", { status: 404 });
    }

    await prisma.horarios.delete({
      where: {
        id: horarioId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[HORARIOS_DELETE]", error);
    return new NextResponse("Erro ao deletar horário", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const horarioId = searchParams.get("id");

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  if (!horarioId) {
    return new NextResponse("ID do horário não fornecido", { status: 400 });
  }

  try {
    const body = await req.json();
    const { diaSemana, horaInicio, horaFim } = body;
    
    const user = session.user as UserWithRole;
    const userRole = user.role;
    let espacoId: string | null = null;

    if (userRole === "espaco" && user.id) {
      espacoId = user.id;
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
        return new NextResponse("Espaço não encontrado", { status: 404 });
      }

      espacoId = admin.espacos[0].id;
    }

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Verificar se o horário pertence ao espaço
    const horario = await prisma.horarios.findUnique({
      where: {
        id: horarioId
      }
    });

    if (!horario || horario.espacoId !== espacoId) {
      return new NextResponse("Horário não encontrado ou não pertence ao espaço", { status: 404 });
    }

    // Validações
    if (!diaSemana || !horaInicio || !horaFim) {
      return new NextResponse("Dados incompletos", { status: 400 });
    }

    const horarioAtualizado = await prisma.horarios.update({
      where: {
        id: horarioId
      },
      data: {
        diaSemana,
        horaInicio,
        horaFim
      }
    });

    return NextResponse.json(horarioAtualizado);
  } catch (error) {
    console.error("[HORARIOS_PUT]", error);
    return new NextResponse("Erro ao atualizar horário", { status: 500 });
  }
}
