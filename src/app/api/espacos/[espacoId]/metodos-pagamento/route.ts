import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema para validação da requisição
const metodosSchema = z.object({
  pix: z.boolean().default(true),
  cartaoCredito: z.boolean().default(true),
  cartaoDebito: z.boolean().default(true),
  boletoBancario: z.boolean().default(false),
  transferenciaBancaria: z.boolean().default(false),
  pagamentoRecorrente: z.boolean().default(false)
});

export async function GET(
  req: NextRequest,
  { params }: { params: { espacoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem permissão para acessar este espaço
    const espacoId = params.espacoId as string;
    
    // Se não for admin, verificar se o usuário é dono ou tem permissão no espaço
    if (session.user?.role !== "admin") {
      const userEspaco = await prisma.espaco.findFirst({
        where: {
          id: espacoId,
          OR: [
            // Caso seja um espaço acessando suas próprias configurações
            { 
              id: session.user?.id // Para um espaço, o id do usuário é o mesmo do espaço
            },
            // Caso seja um usuário com acesso ao espaço
            {
              usuarios: {
                some: {
                  id: session.user?.id
                }
              }
            }
          ]
        }
      });

      if (!userEspaco) {
        return NextResponse.json({ error: "Acesso negado a este espaço" }, { status: 403 });
      }
    }

    // Buscar configuração do espaço
    const espaco = await prisma.espaco.findUnique({
      where: { id: espacoId },
      select: {
        id: true,
      }
    });

    if (!espaco) {
      return NextResponse.json({ error: "Espaço não encontrado" }, { status: 404 });
    }

    // Valores padrão para métodos de pagamento
    let metodosPagamento = {
      pix: true,
      cartaoCredito: true,
      cartaoDebito: true,
      boletoBancario: false,
      transferenciaBancaria: false,
      pagamentoRecorrente: false
    };

    try {
      // Verificar se há configurações extras no banco
      const spaceConfig = await prisma.spaceConfig.findUnique({
        where: { id: espacoId }
      });
      
      // Se existir configuração, extrair os valores relevantes
      // @ts-ignore - Campo existe no banco mas não está refletido nos tipos
      if (spaceConfig && spaceConfig.metodosPagamento) {
        // @ts-ignore - Campo existe no banco mas não está refletido nos tipos
        const metodosPagamentoConfig = typeof spaceConfig.metodosPagamento === 'string' 
          ? JSON.parse(spaceConfig.metodosPagamento) 
          : spaceConfig.metodosPagamento;
          
        metodosPagamento = {
          ...metodosPagamento,
          ...metodosPagamentoConfig
        };
      }
    } catch (error) {
      console.error("Erro ao buscar configurações de métodos de pagamento:", error);
    }

    return NextResponse.json(metodosPagamento);
  } catch (error) {
    console.error("Erro ao buscar métodos de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar métodos de pagamento" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { espacoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem permissão para acessar este espaço
    const espacoId = params.espacoId as string;
    
    // Se não for admin, verificar se o usuário é dono ou tem permissão no espaço
    if (session.user?.role !== "admin") {
      const userEspaco = await prisma.espaco.findFirst({
        where: {
          id: espacoId,
          OR: [
            // Caso seja um espaço acessando suas próprias configurações
            { 
              id: session.user?.id // Para um espaço, o id do usuário é o mesmo do espaço
            },
            // Caso seja um usuário com acesso ao espaço
            {
              usuarios: {
                some: {
                  id: session.user?.id
                }
              }
            }
          ]
        }
      });

      if (!userEspaco) {
        return NextResponse.json({ error: "Acesso negado a este espaço" }, { status: 403 });
      }
    }

    // Validar dados da requisição
    const body = await req.json();
    const validationResult = metodosSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const metodosPagamento = validationResult.data;

    // Buscar espaço e metadata existente
    const espaco = await prisma.espaco.findUnique({
      where: { id: espacoId },
      select: { metadata: true }
    });

    if (!espaco) {
      return NextResponse.json({ error: "Espaço não encontrado" }, { status: 404 });
    }

    // Atualizar a configuração de métodos de pagamento
    // @ts-ignore - Campo existe no banco mas não está refletido nos tipos
    await prisma.spaceConfig.upsert({
      where: { id: espacoId },
      update: {
        // @ts-ignore - Campo existe no banco mas não está refletido nos tipos
        metodosPagamento: metodosPagamento
      },
      create: {
        id: espacoId,
        // @ts-ignore - Campo existe no banco mas não está refletido nos tipos
        metodosPagamento: metodosPagamento
      },
    });

    return NextResponse.json({
      success: true,
      message: "Métodos de pagamento atualizados com sucesso",
      data: metodosPagamento,
    });
  } catch (error) {
    console.error("Erro ao salvar métodos de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao salvar métodos de pagamento" },
      { status: 500 }
    );
  }
}
