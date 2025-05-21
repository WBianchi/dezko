'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Heading } from '@/components/heading'
import { Separator } from '@/components/ui/separator'
import { columns } from './columns'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'

export default function AvaliacoesPage() {
  const { data: avaliacoes, isLoading } = useQuery({
    queryKey: ['avaliacoes-espaco'],
    queryFn: async () => {
      const response = await fetch('/api/espaco/avaliacoes')
      return response.json()
    },
  })

  // Calcular estatísticas
  const stats = avaliacoes ? {
    totalAvaliacoes: avaliacoes.length,
    mediaEstrelas: avaliacoes.reduce((acc: number, av: any) => acc + av.estrelas, 0) / avaliacoes.length || 0,
    cincoEstrelas: avaliacoes.filter((av: any) => av.estrelas === 5).length,
    taxaCincoEstrelas: (avaliacoes.filter((av: any) => av.estrelas === 5).length / avaliacoes.length) * 100 || 0
  } : {
    totalAvaliacoes: 0,
    mediaEstrelas: 0,
    cincoEstrelas: 0,
    taxaCincoEstrelas: 0
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Avaliações"
          description="Gerencie as avaliações do seu espaço"
        />
        
        <div className="grid gap-4 grid-cols-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Total de Avaliações</h3>
            <p className="text-2xl font-bold">{stats.totalAvaliacoes}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Média de Estrelas</h3>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold">{stats.mediaEstrelas.toFixed(1)}</p>
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Avaliações 5 Estrelas</h3>
            <p className="text-2xl font-bold">{stats.cincoEstrelas}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Taxa de 5 Estrelas</h3>
            <p className="text-2xl font-bold">{stats.taxaCincoEstrelas.toFixed(1)}%</p>
          </div>
        </div>

        <Separator />
        <DataTable
          columns={columns}
          data={avaliacoes || []}
          searchKey="usuario"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
