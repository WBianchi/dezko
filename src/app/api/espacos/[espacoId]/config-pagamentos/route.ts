import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { setupOpenPixForMerchant } from "@/lib/openpix";
import axios from "axios";

// Schema para validação da requisição
const configSchema = z.object({
  // OpenPix - Com chave PIX e tipo de chave
  openPixEnabled: z.boolean().default(false),
  pixKey: z.string().optional().nullable(),
  pixKeyType: z.enum(["CPF", "CNPJ", "EMAIL", "TELEFONE", "CHAVE_ALEATORIA"]).optional().nullable(),
  
  // Stripe
  stripeEnabled: z.boolean().default(false),
  stripeAccountId: z.string().optional().nullable(),
  stripeConnectStatus: z.enum(["pending", "connected", "disconnected"]).optional().default("pending"),
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

    // Acessar o ID do espaço diretamente da URL
    const espacoId = params.espacoId;
    
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

    // Buscar espaco e suas configuracoes
    const espaco = await prisma.espaco.findUnique({
      where: { id: espacoId },
      select: {
        id: true,
        nome: true,
        stripeConnectAccountId: true,
      }
    });
    
    // Buscar configuracao na tabela SpaceConfig onde armazenamos os IDs
    const spaceConfig = await prisma.spaceConfig.findUnique({
      where: { id: espacoId }
    });

    if (!espaco) {
      return NextResponse.json({ error: "Espaço não encontrado" }, { status: 404 });
    }

    // Definir valores padrão para configurações
    let openPixEnabled = false;
    let pixKey = "";
    let pixKeyType = "CPF";
    let stripeEnabled = false;
    let stripeConnectStatus = "pending";
    
    // Buscar configurações adicionais da tabela SpaceConfig se necessário
    try {
      // Verificar se há configurações extras no banco
      const spaceConfig = await prisma.spaceConfig.findUnique({
        where: { id: espacoId }
      });
      
      // Se existir configuração, extrair os valores relevantes
      if (spaceConfig && spaceConfig.mercadoPago) {
        const mercadoPagoConfig = typeof spaceConfig.mercadoPago === 'string' 
          ? JSON.parse(spaceConfig.mercadoPago) 
          : spaceConfig.mercadoPago;
          
        openPixEnabled = mercadoPagoConfig.openPixEnabled || false;
        pixKey = mercadoPagoConfig.pixKey || "";
        pixKeyType = mercadoPagoConfig.pixKeyType || "CPF";
        stripeEnabled = mercadoPagoConfig.stripeEnabled || false;
        stripeConnectStatus = mercadoPagoConfig.stripeConnectStatus || "pending";
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
    }

    // Extrair IDs da configuração se existirem
    let stripeAccountId = ""
    
    if (spaceConfig && spaceConfig.mercadoPago) {
      // Tentar extrair configurações adicionais dos metadados se existirem
      try {
        const mercadoPagoConfig = typeof spaceConfig.mercadoPago === 'string' 
          ? JSON.parse(spaceConfig.mercadoPago) 
          : spaceConfig.mercadoPago;
          
        stripeAccountId = mercadoPagoConfig.stripeAccountId || "";
      } catch (err) {
        console.error("Erro ao parsear configurações:", err);
      }
    }
    
    // Verificar se o espaço tem uma conta Stripe Connect
    if (espaco?.stripeConnectAccountId) {
      stripeAccountId = espaco.stripeConnectAccountId;
      stripeEnabled = true;
      stripeConnectStatus = "connected";
    }

    // Montar objeto de configuração com dados das diferentes tabelas
    const configData = {
      openPixEnabled,
      stripeEnabled,
      stripeAccountId,
      stripeConnectStatus,
    };

    return NextResponse.json(configData);
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações de pagamento" },
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

    // Acessar o ID do espaço diretamente da URL
    const espacoId = params.espacoId;
    
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
    const validationResult = configSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Preparar dados para salvar na configuração
    const mercadoPagoConfig = {
      openPixEnabled: data.openPixEnabled || false,
      pixKey: data.pixKey || null,
      pixKeyType: data.pixKeyType || "CPF",
      stripeEnabled: data.stripeEnabled || false,
      stripeAccountId: data.stripeAccountId || "",  // Salvar stripe account ID
      stripeConnectStatus: data.stripeConnectStatus || "pending",
    };
    
    // Se o OpenPIX for ativado e uma chave PIX for fornecida, configurar a conta no OpenPIX
    if (data.openPixEnabled && data.pixKey) {
      try {
        // Buscar os dados do espaço para configurar a subconta
        const espaco = await prisma.espaco.findUnique({
          where: { id: espacoId },
          select: { nome: true }
        });

        // Usar o tipo de chave PIX informado para determinar se é um documento
        const documento = data.pixKeyType === "CPF" || data.pixKeyType === "CNPJ" ? data.pixKey : undefined;

        // Configurar a subconta do lojista no OpenPIX usando a chave PIX informada
        await setupOpenPixForMerchant(espacoId, data.pixKey, espaco?.nome, documento);
      } catch (error) {
        console.error("Erro ao configurar OpenPIX:", error);
        // Continuar mesmo com erro, pois podemos tentar novamente mais tarde
      }
    }

    // Buscar espaço
    const espaco = await prisma.espaco.findUnique({
      where: { id: espacoId },
      select: { id: true, nome: true, stripeConnectAccountId: true }
    });
    
    // Atualizar ou criar configuração
    // Atualizar configuração na tabela SpaceConfig
    await prisma.spaceConfig.upsert({
      where: { id: espacoId },
      update: {
        mercadoPago: mercadoPagoConfig,
      },
      create: {
        id: espacoId,
        mercadoPago: mercadoPagoConfig,
      },
    });
    
    // Se houver uma conta Stripe configurada, atualizar o espaço também
    if (data.stripeAccountId) {
      await prisma.espaco.update({
        where: { id: espacoId },
        data: {
          stripeConnectAccountId: data.stripeAccountId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Configurações salvas com sucesso",
      data: {
        openPixEnabled: data.openPixEnabled,
        pixKey: data.pixKey,
        pixKeyType: data.pixKeyType,
        stripeEnabled: data.stripeEnabled,
        stripeAccountId: data.stripeAccountId,
        stripeConnectStatus: data.stripeConnectStatus
      },
    });
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configurações de pagamento" },
      { status: 500 }
    );
  }
}
