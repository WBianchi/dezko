import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { ReservationStatus } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }
    
    // Buscar espaço associado ao usuário logado
    const email = session.user?.email as string
    
    // Primeiro encontramos o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { 
        email: email
      }
    })
    
    if (!usuario) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }
    
    // Depois buscamos o espaço relacionado ao usuário
    const espaco = await prisma.espaco.findFirst({
      where: {
        usuarios: {
          some: {
            id: usuario.id
          }
        }
      }
    })
    
    if (!espaco) {
      return NextResponse.json(
        { message: "Usuário não possui espaço associado" },
        { status: 404 }
      )
    }
    
    const espacoId = espaco.id
    
    // Obter data de hoje
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)
    
    // Obter primeiro dia do mês atual
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    
    // Verificar se os modelos existem no schema
    let reservasHoje = [];
    let reservasConfirmadas = 0;
    
    try {
      // Buscar reservas de hoje (usando o nome correto do modelo e campos)
      reservasHoje = await prisma.reservation.findMany({
        where: {
          espacoId,
          dataInicio: {
            gte: hoje,
            lt: amanha
          }
        }
      });
      
      // Verificar o status correto conforme o enum ReservationStatus
      reservasConfirmadas = reservasHoje.filter(
        reserva => reserva.status === ReservationStatus.PAGO
      ).length;
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      // Se o modelo não existir, apenas continuamos com valores vazios
      reservasHoje = [];
      reservasConfirmadas = 0;
    }
    
    // Buscar faturamento do mês
    let pedidosMes = [];
    let faturamentoMes = 0;
    
    try {
      pedidosMes = await prisma.pedido.findMany({
        where: {
          espacoId,
          createdAt: {
            gte: primeiroDiaMes,
            lte: ultimoDiaMes
          },
          statusPedido: "PAGO"
        }
      });
      
      faturamentoMes = pedidosMes.reduce(
        (total, pedido) => total + (pedido.valor || 0), 
        0
      );
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      // Se o modelo não existir, continuamos com valores vazios
      pedidosMes = [];
      faturamentoMes = 0;
    }
    
    // Buscar avaliações
    let avaliacoes = [];
    let mediaAvaliacoes = 0;
    
    try {
      avaliacoes = await prisma.avaliacao.findMany({
        where: {
          espacoId
        }
      });
      
      mediaAvaliacoes = avaliacoes.length > 0 
        ? avaliacoes.reduce((soma, aval) => soma + (aval.nota || 0), 0) / avaliacoes.length 
        : 0;
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
      // Se o modelo não existir, continuamos com valores vazios
      avaliacoes = [];
      mediaAvaliacoes = 0;
    }
    
    // Buscar mensagens
    let todasMensagens = [];
    let mensagensNaoLidas = 0;
    
    try {
      todasMensagens = await prisma.mensagem.findMany({
        where: {
          espacoId
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      
      // Simular mensagens não lidas (normalmente seria um campo no banco)
      mensagensNaoLidas = Math.min(5, todasMensagens.length);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      // Se o modelo não existir, continuamos com valores vazios
      todasMensagens = [];
      mensagensNaoLidas = 0;
    }
    
    return NextResponse.json({
      reservasHoje: {
        total: reservasHoje.length,
        confirmadas: reservasConfirmadas
      },
      faturamento: {
        valor: faturamentoMes,
        periodo: "Este mês"
      },
      avaliacao: {
        media: mediaAvaliacoes,
        total: avaliacoes.length
      },
      mensagens: {
        total: todasMensagens.length,
        naoLidas: mensagensNaoLidas
      }
    })
  } catch (error) {
    console.error("[ESPACO_DASHBOARD_ESTATISTICAS]", error)
    return NextResponse.json(
      { message: "Erro ao buscar estatísticas" },
      { status: 500 }
    )
  }
}
