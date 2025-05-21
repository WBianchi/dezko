'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Heading } from '@/components/heading'
import { Separator } from '@/components/ui/separator'
import { columns } from './columns'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'

export default function AvaliacoesUsuarioPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['avaliacoes-usuario'],
    queryFn: async () => {
      const response = await fetch('/api/usuario/avaliacoes')
      return response.json()
    },
  })

  // Extrair avaliações e estatísticas da resposta da API
  const avaliacoes = data?.avaliacoes || []
  const stats = data?.estatisticas || {
    totalAvaliacoes: 0,
    mediaEstrelas: 0,
    cincoEstrelas: 0,
    espacosAvaliados: 0
  }
  
  // Calcular estatísticas adicionais se necessário
  const mediaCalculada = avaliacoes.length > 0 
    ? avaliacoes.reduce((acc: number, av: any) => acc + av.estrelas, 0) / avaliacoes.length 
    : 0
  const cincoEstrelasCalculadas = avaliacoes.filter((av: any) => av.estrelas === 5).length
  const espacosCalculados = avaliacoes.length > 0 
    ? new Set(avaliacoes.map((av: any) => av.espaco?.id)).size 
    : 0

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Minhas Avaliações"
          description="Visualize e gerencie suas avaliações feitas para espaços"
        />
        
        <div className="grid gap-4 grid-cols-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Total de Avaliações</h3>
            <p className="text-2xl font-bold">{stats.totalAvaliacoes}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Média de Estrelas</h3>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold">{(stats.mediaEstrelas || mediaCalculada).toFixed(1)}</p>
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Avaliações 5 Estrelas</h3>
            <p className="text-2xl font-bold">{stats.cincoEstrelas || cincoEstrelasCalculadas}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Espaços Avaliados</h3>
            <p className="text-2xl font-bold">{stats.espacosAvaliados || espacosCalculados}</p>
          </div>
        </div>

        <Separator />
        <DataTable
          columns={columns}
          data={avaliacoes || []}
          searchKey="espaco"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
