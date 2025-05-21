import { Metadata } from "next"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { prisma } from "@/lib/prisma"
import { PagamentosClient } from "./client"

export const metadata: Metadata = {
  title: "Administração - Pedidos",
  description: "Gerenciamento de pedidos do sistema",
}

async function getData() {
  try {
    console.log("Iniciando busca de pagamentos...")
    
    // Buscar todos os pedidos de agenda
    const pedidos = await prisma.pedido.findMany({
      include: {
        usuario: true,
        espaco: true,
        agenda: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    console.log("Pedidos encontrados:", pedidos.length)
    
    // Buscar todas as renovações de assinatura
    const renovacoes = await prisma.renovacaoAssinatura.findMany({
      include: {
        assinatura: {
          include: {
            espaco: true,
            plano: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    
    console.log("Renovações de assinatura encontradas:", renovacoes.length)
    
    // Transformar pedidos
    const pedidosTransformados = pedidos.map((pedido) => {
      // Verifica se todos os relacionamentos existem antes de acessá-los
      const usuario = pedido.usuario?.nome || "Usuário não encontrado"
      const espaco = pedido.espaco?.nome || "Espaço não encontrado"
      
      return {
        id: pedido.id,
        reservaId: pedido.id, // Usando o ID do pedido como referência
        usuario: usuario,
        espaco: espaco,
        valor: pedido.valor.toFixed(2),
        status: pedido.statusPedido,
        gateway: pedido.mercadoPagoPaymentId ? "mercadopago" : "outro",
        gatewayId: pedido.mercadoPagoPaymentId || "N/A",
        formaPagamento: pedido.formaPagamento,
        tipo: "agenda",
        createdAt: format(pedido.createdAt, "PPP", { locale: ptBR })
      }
    })
    
    // Transformar renovações de assinatura
    const renovacoesTransformadas = renovacoes.map((renovacao) => {
      const espaco = renovacao.assinatura?.espaco?.nome || "Espaço não encontrado"
      const plano = renovacao.assinatura?.plano?.nome || "Plano não identificado"
      
      return {
        id: renovacao.id,
        reservaId: renovacao.assinaturaId,
        usuario: `Assinatura: ${plano}`,
        espaco: espaco,
        valor: renovacao.valor.toFixed(2),
        status: renovacao.status,
        gateway: renovacao.gateway,
        gatewayId: renovacao.gatewayId || "N/A",
        formaPagamento: renovacao.formaPagamento || "PIX",
        tipo: "assinatura",
        createdAt: format(renovacao.createdAt, "PPP", { locale: ptBR })
      }
    })
    
    // Combinar ambos os arrays
    return [...pedidosTransformados, ...renovacoesTransformadas];
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error)
    return []
  }
}

export default async function PagamentosPage() {
  const data = await getData()

  // Calcular estatísticas
  const stats = {
    totalPedidos: data.length,
    pedidosAprovados: data.filter((p) => {
      const status = p.status.toLowerCase();
      return status === "pago";
    }).length,
    valorTotal: data.reduce((acc, p) => acc + parseFloat(p.valor), 0),
    taxaAprovacao: data.length > 0 ? (data.filter((p) => {
      const status = p.status.toLowerCase();
      return status === "pago";
    }).length / data.length) * 100 : 0
  }

  return <PagamentosClient data={data} stats={stats} />
}
