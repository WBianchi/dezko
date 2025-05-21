'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Heading } from '@/components/heading'
import { Separator } from '@/components/ui/separator'
import { columns } from './columns'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ReservasPage() {
  const { data: reservas, isLoading } = useQuery({
    queryKey: ['reservas-espaco'],
    queryFn: async () => {
      const response = await fetch('/api/espaco/reservas')
      const data = await response.json()
      return data.map((reserva: any) => ({
        ...reserva,
        dataInicio: new Date(reserva.dataInicio),
        dataFim: new Date(reserva.dataFim),
        createdAt: new Date(reserva.createdAt)
      }))
    },
  })

  // Calcular estatísticas
  const stats = reservas ? {
    totalReservas: reservas.length,
    reservasConfirmadas: reservas.filter((r: any) => r.status === "confirmada").length,
    valorTotal: reservas.reduce((acc: number, r: any) => acc + r.valor, 0),
    taxaConfirmacao: (reservas.filter((r: any) => r.status === "confirmada").length / reservas.length) * 100 || 0
  } : {
    totalReservas: 0,
    reservasConfirmadas: 0,
    valorTotal: 0,
    taxaConfirmacao: 0
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Reservas"
          description="Gerencie as reservas do seu espaço"
        />
        
        <div className="grid gap-4 grid-cols-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Total de Reservas</h3>
            <p className="text-2xl font-bold">{stats.totalReservas}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Reservas Confirmadas</h3>
            <p className="text-2xl font-bold">{stats.reservasConfirmadas}</p>
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
            <h3 className="font-semibold text-sm text-muted-foreground">Taxa de Confirmação</h3>
            <p className="text-2xl font-bold">{stats.taxaConfirmacao.toFixed(1)}%</p>
          </div>
        </div>

        <Separator />
        <DataTable
          columns={columns}
          data={reservas || []}
          searchKey="usuario"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
