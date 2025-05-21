import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import axios from "axios";

// Schema para validação da requisição
const pagamentoRapidoSchema = z.object({
  enabled: z.boolean().default(false),
  valor: z.number().min(1, "O valor mínimo é R$ 1,00"),
  descricao: z.string().min(3, "Descrição muito curta").max(100, "Descrição muito longa"),
  textoAgradecimento: z.string().min(3, "Texto muito curto").max(200, "Texto muito longo").optional(),
});

// Função para gerar QR Code
async function gerarQRCode(url: string): Promise<string> {
  try {
    // Usando serviço gratuito de QR Code
    const response = await axios.get(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`);
    
    // URL da imagem do QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  } catch (error) {
    console.error("Erro ao gerar QR code:", error);
    return ""; 
  }
}

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
    const espacoId = params.espacoId;
    
    // Se não for admin, verificar se o usuário é dono ou tem permissão no espaço
    if (session.user?.role !== "admin") {
      const userEspaco = await prisma.espaco.findFirst({
        where: {
          id: espacoId,
          OR: [
            { usuarioId: session.user?.id },
            {
              usuarios: {
                some: {
                  usuarioId: session.user?.id,
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
        nome: true,
        slug: true,
        metadata: true,
      }
    });

    if (!espaco) {
      return NextResponse.json({ error: "Espaço não encontrado" }, { status: 404 });
    }

    // Extrair configurações de pagamento rápido
    let pagamentoRapido = {
      enabled: false,
      valor: 100,
      descricao: `Pagamento para ${espaco.nome}`,
      textoAgradecimento: "Obrigado por seu pagamento!",
      pagamentoLink: "",
      qrCodeUrl: ""
    };

    try {
      const metadata = espaco.metadata ? 
        (typeof espaco.metadata === 'string' ? JSON.parse(espaco.metadata) : espaco.metadata) 
        : {};
      
      if (metadata.pagamentoRapido) {
        pagamentoRapido = {
          ...pagamentoRapido,
          ...metadata.pagamentoRapido
        };
      }
      
      // Gerar link de pagamento se habilitado
      if (pagamentoRapido.enabled && espaco.slug) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br";
        pagamentoRapido.pagamentoLink = `${baseUrl}/pagamento/${espaco.slug}?valor=${pagamentoRapido.valor}&ref=quick`;
        
        // Se não houver QR code, gerar um
        if (!pagamentoRapido.qrCodeUrl) {
          pagamentoRapido.qrCodeUrl = await gerarQRCode(pagamentoRapido.pagamentoLink);
        }
      }
    } catch (error) {
      console.error("Erro ao processar metadata:", error);
    }

    return NextResponse.json(pagamentoRapido);
  } catch (error) {
    console.error("Erro ao buscar configuração de pagamento rápido:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configuração de pagamento rápido" },
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
    const espacoId = params.espacoId;
    
    // Se não for admin, verificar se o usuário é dono ou tem permissão no espaço
    if (session.user?.role !== "admin") {
      const userEspaco = await prisma.espaco.findFirst({
        where: {
          id: espacoId,
          OR: [
            { usuarioId: session.user?.id },
            {
              usuarios: {
                some: {
                  usuarioId: session.user?.id,
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
    const validationResult = pagamentoRapidoSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const pagamentoRapido = validationResult.data;

    // Buscar espaço e metadata existente
    const espaco = await prisma.espaco.findUnique({
      where: { id: espacoId },
      select: { 
        metadata: true,
        slug: true,
        nome: true
      }
    });

    if (!espaco) {
      return NextResponse.json({ error: "Espaço não encontrado" }, { status: 404 });
    }
    
    // Preparar metadata atualizada
    let metadata = {};
    try {
      metadata = espaco.metadata ? 
        (typeof espaco.metadata === 'string' ? JSON.parse(espaco.metadata) : espaco.metadata) 
        : {};
    } catch (error) {
      console.error("Erro ao processar metadata existente:", error);
    }

    // Gerar link de pagamento se habilitado
    let pagamentoLink = "";
    let qrCodeUrl = "";
    
    if (pagamentoRapido.enabled && espaco.slug) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br";
      pagamentoLink = `${baseUrl}/pagamento/${espaco.slug}?valor=${pagamentoRapido.valor}&ref=quick`;
      
      // Gerar QR code
      qrCodeUrl = await gerarQRCode(pagamentoLink);
    }

    // Atualizar apenas a seção de pagamento rápido
    metadata = {
      ...metadata,
      pagamentoRapido: {
        ...pagamentoRapido,
        pagamentoLink,
        qrCodeUrl
      }
    };

    // Atualizar espaço
    // @ts-ignore - Campo existe no banco mas não está refletido nos tipos
    await prisma.espaco.update({
      where: { id: espacoId },
      data: {
        metadata: metadata,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Configuração de pagamento rápido atualizada com sucesso",
      data: {
        ...pagamentoRapido,
        pagamentoLink,
        qrCodeUrl
      },
    });
  } catch (error) {
    console.error("Erro ao salvar configuração de pagamento rápido:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configuração de pagamento rápido" },
      { status: 500 }
    );
  }
}
