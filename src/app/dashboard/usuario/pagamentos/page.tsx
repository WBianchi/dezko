'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Heading } from '@/components/heading'
import { Separator } from '@/components/ui/separator'
import { columns } from './columns'
import { useQuery } from '@tanstack/react-query'

export default function PagamentosUsuarioPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['pagamentos-usuario'],
    queryFn: async () => {
      const response = await fetch('/api/usuario/pagamentos')
      return response.json()
    },
  })

  // Extrair pagamentos e estatísticas da resposta da API
  const pagamentos = data?.pagamentos || []
  const stats = data?.estatisticas || {
    totalPagamentos: 0,
    pagamentosConcluidos: 0,
    valorTotal: 0
  }
  
  // Estatísticas adicionais que não estão na API
  const pagamentosAprovados = pagamentos.filter((p: any) => 
    p.status?.toLowerCase() === "pago" || 
    p.status?.toLowerCase() === "approved"
  ).length
  
  const pagamentosPendentes = pagamentos.filter((p: any) => 
    p.status?.toLowerCase() === "pendente" || 
    p.status?.toLowerCase() === "pending"
  ).length

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Meus Pagamentos"
          description="Acompanhe os pagamentos das suas reservas"
        />
        
        <div className="grid gap-4 grid-cols-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Total de Pagamentos</h3>
            <p className="text-2xl font-bold">{stats.totalPagamentos}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Pagamentos Concluídos</h3>
            <p className="text-2xl font-bold">{stats.pagamentosConcluidos || pagamentosAprovados}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Pagamentos Pendentes</h3>
            <p className="text-2xl font-bold">{pagamentosPendentes}</p>
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
        </div>

        <Separator />

        <DataTable columns={columns} data={pagamentos || []} isLoading={isLoading} searchKey="espaco" />
      </div>
    </div>
  )
}
