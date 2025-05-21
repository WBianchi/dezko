import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Verificar a sessão do usuário
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas administradores podem acessar esta rota." },
        { status: 401 }
      );
    }

    // Contagem total de pagamentos
    const totalPagamentos = await prisma.pagamento.count();
    
    // Buscar pagamentos recentes
    const pagamentosRecentes = await prisma.pagamento.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        reserva: {
          include: {
            usuario: true,
            espaco: true,
          },
        },
      },
    });

    // Buscar status das reservas
    const totalReservas = await prisma.reservation.count();
    const reservasPorStatus = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count 
      FROM Reservation 
      GROUP BY status;
    `;

    // Buscar status dos pedidos
    const totalPedidos = await prisma.pedido.count();
    const pedidosPorStatus = await prisma.$queryRaw`
      SELECT statusPedido as status, COUNT(*) as count 
      FROM Pedido 
      GROUP BY statusPedido;
    `;

    // Buscar pedidos recentes
    const pedidosRecentes = await prisma.pedido.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        usuario: true,
        espaco: true,
      },
    });

    // Retornar dados para debug
    return NextResponse.json({
      statusGeral: {
        totalPagamentos,
        totalReservas,
        totalPedidos,
      },
      estatisticas: {
        reservasPorStatus,
        pedidosPorStatus,
      },
      pagamentosRecentes: pagamentosRecentes.map(p => ({
        id: p.id,
        valor: p.valor,
        status: p.status,
        gateway: p.gateway,
        gatewayId: p.gatewayId,
        reservaId: p.reservaId,
        createdAt: p.createdAt,
        usuario: p.reserva?.usuario?.nome || "N/A",
        espaco: p.reserva?.espaco?.nome || "N/A",
      })),
      pedidosRecentes: pedidosRecentes.map(p => ({
        id: p.id,
        usuarioId: p.usuarioId,
        usuario: p.usuario?.nome || "N/A",
        valor: p.valor,
        status: p.statusPedido,
        espacoId: p.espacoId,
        espaco: p.espaco?.nome || "N/A",
        formaPagamento: p.formaPagamento,
        dataInicio: p.dataInicio,
        dataFim: p.dataFim,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar dados de debug:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de debug" },
      { status: 500 }
    );
  }
}
