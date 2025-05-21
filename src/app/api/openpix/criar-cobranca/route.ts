import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

// Schema para validação da requisição de cobrança
const cobrancaSchema = z.object({
  espacoId: z.string(),
  pedidoId: z.string().optional(),
  valor: z.number().min(1), // Valor em centavos (mínimo 1 centavo)
  descricao: z.string(),
  clienteNome: z.string().optional(),
  clienteEmail: z.string().email().optional(),
  clienteTelefone: z.string().optional(),
});

type CobrancaData = z.infer<typeof cobrancaSchema>;

/**
 * Cria uma cobrança PIX para o espaço especificado
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Validar dados da requisição
    const body = await req.json();
    const validationResult = cobrancaSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // Verificar se o espaço existe e tem o OpenPix ativado
    const espaco = await prisma.espaco.findUnique({
      where: { id: data.espacoId },
      include: {
        configuracao: true,
      }
    });

    if (!espaco) {
      return NextResponse.json({ error: "Espaço não encontrado" }, { status: 404 });
    }

    // Verificar se o OpenPix está ativado nas configurações do espaço
    const mercadoPagoConfig = espaco.configuracao?.mercadoPago ? (
      typeof espaco.configuracao.mercadoPago === 'string' 
        ? JSON.parse(espaco.configuracao.mercadoPago) 
        : espaco.configuracao.mercadoPago
    ) : null;

    const openPixEnabled = mercadoPagoConfig?.openPixEnabled || false;

    if (!openPixEnabled) {
      return NextResponse.json(
        { error: "Pagamento via PIX não está ativado para este espaço" },
        { status: 400 }
      );
    }

    // ID de correlação único para esta cobrança
    const correlationId = data.pedidoId || `dezko-${uuidv4()}`;
    
    // Preparar dados do cliente (se fornecidos)
    const customerData = data.clienteNome ? {
      name: data.clienteNome,
      email: data.clienteEmail,
      phone: data.clienteTelefone,
      taxID: null, // Opcional: poderia incluir CPF/CNPJ se necessário
    } : undefined;

    // Criar a cobrança na OpenPix
    const openPixApiKey = process.env.OPENPIX_AUTH_KEY;
    
    if (!openPixApiKey) {
      return NextResponse.json(
        { error: "Configurações da API OpenPix não encontradas" },
        { status: 500 }
      );
    }

    // Calcular o split (90% para o lojista, 10% para a plataforma)
    const valorTotal = data.valor;
    const valorLojista = Math.floor(valorTotal * 0.9); // 90% para o lojista

    // Chamada para a API da OpenPix
    const openPixResponse = await axios.post(
      "https://api.openpix.com.br/api/v1/charge",
      {
        correlationID: correlationId,
        value: data.valor,
        comment: data.descricao,
        expiresIn: 3600, // 1 hora
        customer: customerData,
        // Definir destinatário (o lojista) - se disponível
        // Na prática, este atributo só seria usado se tiver sido configurado
        // um destinatário específico para o lojista
        ...(valorLojista < valorTotal && {
          splits: [
            {
              pixKey: "425c00e0-e5bc-478d-a95a-0d86e7c67015", // Chave PIX principal da plataforma
              splitValue: valorLojista
            }
          ]
        })
      },
      {
        headers: {
          "Authorization": openPixApiKey,
          "Content-Type": "application/json"
        }
      }
    );

    // Registrar a cobrança no banco de dados
    // @ts-ignore - O modelo foi criado recentemente e pode não estar reconhecido pelo TypeScript
    await prisma.pixCobranca.create({
      data: {
        id: correlationId,
        espacoId: data.espacoId,
        pedidoId: data.pedidoId || null,
        valor: data.valor,
        valorLojista: valorLojista,
        valorPlataforma: data.valor - valorLojista,
        status: "ATIVA",
        descricao: data.descricao,
        qrCodeUrl: openPixResponse.data.charge.qrCodeImage,
        brCode: openPixResponse.data.charge.brCode,
        transactionId: openPixResponse.data.charge.transactionID,
        clienteNome: data.clienteNome || null,
        clienteEmail: data.clienteEmail || null,
        clienteTelefone: data.clienteTelefone || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // Retornar os dados da cobrança
    return NextResponse.json({
      success: true,
      cobranca: {
        id: correlationId,
        qrCodeUrl: openPixResponse.data.charge.qrCodeImage,
        qrCodeTexto: openPixResponse.data.charge.brCode,
        valor: data.valor,
        descricao: data.descricao,
        paymentLinkUrl: openPixResponse.data.charge.paymentLinkUrl,
        expiraEm: 3600, // 1 hora em segundos
      }
    });
  } catch (error) {
    console.error("Erro ao criar cobrança PIX:", error);
    return NextResponse.json(
      { error: "Erro ao criar cobrança PIX" },
      { status: 500 }
    );
  }
}
