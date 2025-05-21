"use client"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { OverviewCard } from "@/components/ui/overview-card"
import { Download, Calendar, CalendarDays, CalendarRange, AlertCircle } from "lucide-react"
import { DataTable } from "./data-table"
import { columns } from "./columns"

interface ReservasClientProps {
  data: any[]
  stats: {
    reservasHoje: number
    reservasSemana: number
    reservasMes: number
    taxaCancelamento: number
  }
}

export function ReservasClient({ data, stats }: ReservasClientProps) {
  const handleExportarCSV = () => {
    if (!data) return

    const headers = [
      "ID",
      "Usuário",
      "Espaço",
      "Data Início",
      "Data Fim",
      "Valor",
      "Status",
      "Plano",
      "Agenda"
    ]

    const csvData = data.map((reserva) => [
      reserva.id,
      reserva.usuario,
      reserva.espaco,
      reserva.dataInicio,
      reserva.dataFim,
      reserva.valor,
      reserva.status,
      reserva.plano,
      reserva.agenda
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "reservas.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filters = [
    {
      columnId: "statusPedido",
      title: "Status",
      options: [
        { label: "Confirmada", value: "confirmada" },
        { label: "Pendente", value: "pendente" },
        { label: "Cancelada", value: "cancelada" }
      ]
    }
  ]

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Reservas"
            description="Gerencie as reservas do sistema"
          />
          <Button onClick={handleExportarCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
        <Separator />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            title="Reservas Hoje"
            value={stats.reservasHoje}
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          />
          <OverviewCard
            title="Reservas na Semana"
            value={stats.reservasSemana}
            icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
          />
          <OverviewCard
            title="Reservas no Mês"
            value={stats.reservasMes}
            icon={<CalendarRange className="h-4 w-4 text-muted-foreground" />}
          />
          <OverviewCard
            title="Taxa de Cancelamento"
            value={`${stats.taxaCancelamento.toFixed(1)}%`}
            icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <Separator />
        <DataTable
          columns={columns}
          data={data}
          searchKey="usuario"
          filters={filters}
        />
      </div>
    </div>
  )
}
