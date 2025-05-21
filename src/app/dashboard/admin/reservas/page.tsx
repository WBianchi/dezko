import { Metadata } from "next"
import { format, isSameDay, isSameWeek, isSameMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { prisma } from "@/lib/prisma"
import { ReservasClient } from "./client"

export const metadata: Metadata = {
  title: "Administração - Reservas",
  description: "Gerenciamento de reservas do sistema",
}

async function getData() {
  try {
    const reservas = await prisma.reservation.findMany({
      include: {
        usuario: true,
        espaco: true,
        plano: true,
        agenda: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return reservas.map((reserva) => ({
      id: reserva.id,
      usuario: reserva.usuario.nome,
      espaco: reserva.espaco.nome,
      dataInicio: format(new Date(reserva.dataInicio), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      dataFim: format(new Date(reserva.dataFim), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      valor: reserva.valor,
      statusPedido: reserva.status,
      plano: reserva.plano?.nome || "N/A",
      agenda: reserva.agenda.tipoReserva
    }))
  } catch (error) {
    console.error("Erro ao buscar reservas:", error)
    throw error
  }
}

export default async function ReservasPage() {
  const data = await getData()
  const hoje = new Date()

  // Calcular estatísticas
  const stats = {
    reservasHoje: data.filter((r) => isSameDay(new Date(r.dataInicio), hoje)).length,
    reservasSemana: data.filter((r) => isSameWeek(new Date(r.dataInicio), hoje, { locale: ptBR })).length,
    reservasMes: data.filter((r) => isSameMonth(new Date(r.dataInicio), hoje)).length,
    taxaCancelamento: (data.filter((r) => r.statusPedido === "cancelada").length / data.length) * 100 || 0
  }

  return <ReservasClient data={data} stats={stats} />
}
