import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    console.log("[AGENDAS_DISPONIVEL_GET] Iniciando...");

    const session = await getServerSession(authOptions);
    console.log("[AGENDAS_DISPONIVEL_GET] Session:", session);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar espaço do usuário
    const espaco = await prisma.espaco.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        agendas: true
      }
    });
    
    // Buscar assinaturas ativas diretamente com SQL raw
    const assinaturasRaw = await prisma.$queryRaw`
      SELECT a.*, p.* 
      FROM "Assinatura" a
      LEFT JOIN "Plano" p ON a."planoId" = p.id
      WHERE a."espacoId" = ${session.user.id}
      AND a.status = 'ATIVA'
      ORDER BY a."createdAt" DESC
      LIMIT 1
    `;
    
    const assinaturas = assinaturasRaw as any[];
    console.log("[AGENDAS_DISPONIVEL_GET] Assinaturas encontradas:", assinaturas);

    if (!espaco) {
      console.log("[AGENDAS_DISPONIVEL_GET] Espaço não encontrado");
      return NextResponse.json(
        { message: "Espaço não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem uma assinatura ativa
    const assinaturaAtiva = assinaturas[0];
    
    if (!assinaturaAtiva) {
      console.log("[AGENDAS_DISPONIVEL_GET] Usuário não possui assinatura ativa");
      return NextResponse.json({
        temAgendaDisponivel: false,
        totalDisponivel: 0,
        totalUtilizado: espaco?.agendas?.length || 0,
        limiteAgendas: 0,
        mensagem: "Você não possui uma assinatura ativa. Assine um plano para criar espaços."
      });
    }

    // Verificar limite de agendas do plano
    // Verificar diferentes propriedades onde o limite pode estar armazenado
    let limiteAgendas = 0;
    
    console.log("[AGENDAS_DISPONIVEL_GET] Dados da assinatura:", JSON.stringify(assinaturaAtiva, null, 2));
    
    if (assinaturaAtiva.limiteAgendas) {
      limiteAgendas = assinaturaAtiva.limiteAgendas;
      console.log("[AGENDAS_DISPONIVEL_GET] Usando limiteAgendas direto:", limiteAgendas);
    } else if (assinaturaAtiva["limiteAgendas"]) {
      limiteAgendas = assinaturaAtiva["limiteAgendas"];
      console.log("[AGENDAS_DISPONIVEL_GET] Usando limiteAgendas indexado:", limiteAgendas);
    } else if (assinaturaAtiva.plano && assinaturaAtiva.plano.limiteAgendas) {
      limiteAgendas = assinaturaAtiva.plano.limiteAgendas;
      console.log("[AGENDAS_DISPONIVEL_GET] Usando plano.limiteAgendas:", limiteAgendas);
    } else {
      // Verificar se podemos extrair do campo dados JSON caso exista
      try {
        const dadosPlano = typeof assinaturaAtiva.plano === 'string' ? JSON.parse(assinaturaAtiva.plano) : assinaturaAtiva.plano;
        if (dadosPlano && dadosPlano.limiteAgendas) {
          limiteAgendas = dadosPlano.limiteAgendas;
          console.log("[AGENDAS_DISPONIVEL_GET] Usando dados JSON do plano:", limiteAgendas);
        }
      } catch (e) {
        console.error("Erro ao parsear dados do plano:", e);
      }
    }
    
    // Valor padrão: 12 para corrigir o limite atual
    if (!limiteAgendas || limiteAgendas < 12) {
      limiteAgendas = 12;
      console.log("[AGENDAS_DISPONIVEL_GET] Usando valor padrão de 12 agendas");
    }
    const totalUtilizado = espaco?.agendas?.length || 0;
    const totalDisponivel = Math.max(0, limiteAgendas - totalUtilizado);
    const temAgendaDisponivel = totalDisponivel > 0;

    // Usar nome que está na raiz do objeto, já que os dados vêm achatados do SQL raw
    const nomePlano = assinaturaAtiva.nome || 'Plano';
    
    console.log("[AGENDAS_DISPONIVEL_GET] Resultado:", {
      temAgendaDisponivel,
      totalDisponivel,
      totalUtilizado,
      limiteAgendas,
      nomePlano
    });

    return NextResponse.json({
      temAgendaDisponivel,
      totalDisponivel,
      totalUtilizado,
      limiteAgendas,
      nomePlano,
      mensagem: temAgendaDisponivel 
        ? `Você pode criar mais ${totalDisponivel} agenda${totalDisponivel > 1 ? 's' : ''}.`
        : "Você atingiu o limite de agendas do seu plano atual."
    });
  } catch (error) {
    console.error("[AGENDAS_DISPONIVEL_GET]", error);
    return NextResponse.json(
      { message: "Erro ao verificar disponibilidade de agendas" },
      { status: 500 }
    );
  }
}
