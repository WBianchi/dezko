'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Heading } from '@/components/heading'
import { Separator } from '@/components/ui/separator'
import { columns } from './columns'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle } from 'lucide-react'
import { NovaMensagemModal } from '@/components/nova-mensagem-modal'

export default function MensagensUsuarioPage() {
  const [modalAberto, setModalAberto] = useState(false)
  
  const { data, isLoading } = useQuery({
    queryKey: ['mensagens-usuario'],
    queryFn: async () => {
      const response = await fetch('/api/usuario/mensagens')
      return response.json()
    },
  })

  // Extrair mensagens e estatísticas da resposta da API
  const mensagens = data?.mensagens || []
  const stats = data?.estatisticas || {
    totalMensagens: 0,
    mensagensNaoLidas: 0,
    mensagensHoje: 0,
    espacosEmContato: 0
  }
  
  // Usamos as estatísticas da API ou calculamos se necessário
  const naoLidas = stats.mensagensNaoLidas || 0
  const mensagensHoje = stats.mensagensHoje || 0
  const espacosDiferentes = stats.espacosEmContato || 0

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Minhas Mensagens"
            description="Gerencie suas conversas com os espaços"
          />
          <Button onClick={() => setModalAberto(true)}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Nova Mensagem
          </Button>
          
          <NovaMensagemModal 
            isOpen={modalAberto} 
            onClose={() => setModalAberto(false)} 
          />
        </div>
        
        <div className="grid gap-4 grid-cols-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Total de Mensagens</h3>
            <p className="text-2xl font-bold">{stats.totalMensagens}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Não Lidas</h3>
            <p className="text-2xl font-bold">{stats.mensagensNaoLidas || naoLidas}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Mensagens Hoje</h3>
            <p className="text-2xl font-bold">{stats.mensagensHoje || mensagensHoje}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Espaços em Contato</h3>
            <p className="text-2xl font-bold">{stats.espacosEmContato || espacosDiferentes}</p>
          </div>
        </div>

        <Separator />
        <DataTable
          columns={columns}
          data={mensagens || []}
          searchKey="espaco"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
