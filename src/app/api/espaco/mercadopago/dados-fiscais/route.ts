import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Extrair dados do corpo da requisição
    const body = await req.json();
    const { razaoSocial, cnpj } = body;

    if (!razaoSocial || !cnpj) {
      return new NextResponse("Dados incompletos", { status: 400 });
    }

    // Validar formato do CNPJ
    const cnpjPattern = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;
    if (!cnpjPattern.test(cnpj)) {
      return new NextResponse("CNPJ inválido", { status: 400 });
    }

    // Buscar e atualizar o espaço
    const espaco = await prisma.espaco.update({
      where: {
        email: session.user.email,
      },
      data: {
        razaoSocial,
        cnpj,
      },
      select: {
        id: true,
        razaoSocial: true,
        cnpj: true,
      },
    });

    return NextResponse.json(espaco);
  } catch (error) {
    console.error("[ESPACO_MP_DADOS_FISCAIS_PUT]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
