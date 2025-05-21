'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Heading } from '@/components/heading'
import { Separator } from '@/components/ui/separator'
import { columns } from './columns'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ReservasUsuarioPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reservas-usuario'],
    queryFn: async () => {
      const response = await fetch('/api/usuario/reservas')
      return response.json()
    },
  })

  // Extrair reservas e estatísticas da resposta da API
  const reservasData = data?.reservas || []
  const reservas = reservasData.map((reserva: any) => ({
    ...reserva,
    dataInicio: new Date(reserva.dataInicio),
    dataFim: new Date(reserva.dataFim),
    createdAt: new Date(reserva.createdAt)
  }))
  
  const stats = data?.estatisticas || {
    totalReservas: 0,
    reservasConfirmadas: 0,
    valorTotal: 0
  }
  
  // Estatísticas adicionais calculadas diretamente dos dados
  const reservasConfirmadas = reservas.filter((r: any) => 
    r.status === "CONFIRMADO" || r.status === "PAGO").length
  const reservasCanceladas = reservas.filter((r: any) => r.status === "CANCELADO").length
  const valorTotal = reservas.reduce((acc: number, r: any) => acc + (r.valor || 0), 0)

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Minhas Reservas"
          description="Visualize e gerencie todas as suas reservas"
        />
        
        <div className="grid gap-4 grid-cols-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Total de Reservas</h3>
            <p className="text-2xl font-bold">{stats.totalReservas}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Reservas Confirmadas</h3>
            <p className="text-2xl font-bold">{stats.reservasConfirmadas || reservasConfirmadas}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Reservas Canceladas</h3>
            <p className="text-2xl font-bold">{stats.reservasCanceladas || reservasCanceladas}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Valor Total</h3>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.valorTotal || valorTotal)}
            </p>
          </div>
        </div>

        <Separator />
        <DataTable
          columns={columns}
          data={reservas || []}
          searchKey="espaco"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
