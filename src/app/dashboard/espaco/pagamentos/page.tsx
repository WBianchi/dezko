'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Heading } from '@/components/heading'
import { Separator } from '@/components/ui/separator'
import { columns } from './columns'
import { useQuery } from '@tanstack/react-query'

export default function PedidosPage() {
  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos-espaco'],
    queryFn: async () => {
      const response = await fetch('/api/espaco/pagamentos')
      return response.json()
    },
  })

  // Calcular estatísticas
  const stats = pedidos ? {
    totalPedidos: pedidos.length,
    pedidosAprovados: pedidos.filter((p: any) => p.status.toLowerCase() === "pago").length,
    valorTotal: pedidos.reduce((acc: number, p: any) => acc + p.valor, 0),
    taxaAprovacao: (pedidos.filter((p: any) => p.status.toLowerCase() === "pago").length / pedidos.length) * 100 || 0
  } : {
    totalPedidos: 0,
    pedidosAprovados: 0,
    valorTotal: 0,
    taxaAprovacao: 0
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Pedidos"
          description="Acompanhe os pedidos do seu espaço"
        />
        
        <div className="grid gap-4 grid-cols-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Total de Pedidos</h3>
            <p className="text-2xl font-bold">{stats.totalPedidos}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Pedidos Aprovados</h3>
            <p className="text-2xl font-bold">{stats.pedidosAprovados}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Valor Total</h3>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.valorTotal)}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Taxa de Aprovação</h3>
            <p className="text-2xl font-bold">{stats.taxaAprovacao.toFixed(1)}%</p>
          </div>
        </div>

        <Separator />

        <DataTable columns={columns} data={pedidos || []} isLoading={isLoading} searchKey="usuario" />
      </div>
    </div>
  )
}
