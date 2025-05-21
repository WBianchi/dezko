"use client"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { OverviewCard } from "@/components/ui/overview-card"
import { Download, CreditCard, Wallet, TrendingUp, AlertCircle } from "lucide-react"
import { DataTable } from "./data-table"
import { columns } from "./columns"

interface PagamentosClientProps {
  data: any[]
  stats: {
    totalPedidos: number
    pedidosAprovados: number
    valorTotal: number
    taxaAprovacao: number
  }
}

export function PagamentosClient({ data, stats }: PagamentosClientProps) {
  const handleExportarCSV = () => {
    if (!data) return

    const headers = [
      "ID",
      "Reserva",
      "Usuário",
      "Espaço",
      "Valor",
      "Status",
      "Gateway",
      "ID do Gateway",
      "Data"
    ]

    const csvData = data.map((pagamento) => [
      pagamento.id,
      pagamento.reservaId,
      pagamento.usuario,
      pagamento.espaco,
      pagamento.valor,
      pagamento.status,
      pagamento.gateway,
      pagamento.gatewayId,
      pagamento.createdAt
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "pedidos.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filters = [
    {
      columnId: "tipo",
      title: "Tipo",
      options: [
        { label: "Agenda", value: "agenda" },
        { label: "Assinatura", value: "assinatura" }
      ]
    },
    {
      columnId: "status",
      title: "Status",
      options: [
        { label: "Aprovado", value: "aprovado" },
        { label: "Pendente", value: "pendente" },
        { label: "Rejeitado", value: "rejeitado" },
        { label: "Cancelado", value: "cancelado" }
      ]
    },
    {
      columnId: "gateway",
      title: "Gateway",
      options: [
        { label: "Mercado Pago", value: "mercadopago" },
        { label: "Stripe", value: "stripe" },
        { label: "OpenPix", value: "openpix" }
      ]
    }
  ]

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Pedidos"
            description="Gerencie os pedidos do sistema"
          />
          <Button onClick={handleExportarCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
        <Separator />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            title="Total de Pedidos"
            value={stats.totalPedidos.toString()}
            icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          />
          <OverviewCard
            title="Pedidos Aprovados"
            value={stats.pedidosAprovados.toString()}
            icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          />
          <OverviewCard
            title="Valor Total"
            value={new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL"
            }).format(stats.valorTotal)}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
          <OverviewCard
            title="Taxa de Aprovação"
            value={`${stats.taxaAprovacao.toFixed(1)}%`}
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
