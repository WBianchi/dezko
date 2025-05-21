'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Heading } from '@/components/heading'
import { Separator } from '@/components/ui/separator'
import { columns } from './columns'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle } from 'lucide-react'
import { NovaMensagemEspacoModal } from '@/components/nova-mensagem-espaco-modal'

export default function MensagensPage() {
  const [modalAberto, setModalAberto] = useState(false)
  
  const { data, isLoading } = useQuery({
    queryKey: ['mensagens-espaco'],
    queryFn: async () => {
      const response = await fetch('/api/espaco/mensagens')
      return response.json()
    },
  })
  
  const mensagens = data?.mensagens || []

  // Calcular estatísticas
  const stats = mensagens ? {
    totalMensagens: mensagens.length,
    naoRespondidas: mensagens.filter((m: any) => !m.respostas || m.respostas.length === 0).length,
    mensagensHoje: mensagens.filter((m: any) => {
      const hoje = new Date()
      const dataMensagem = new Date(m.createdAt)
      return dataMensagem.toDateString() === hoje.toDateString()
    }).length,
    tempoMedioResposta: mensagens
      .filter((m: any) => m.respostas && m.respostas.length > 0)
      .reduce((acc: number, m: any) => {
        const criacao = new Date(m.createdAt)
        const resposta = new Date(m.respostas[0]?.createdAt || m.createdAt)
        return acc + (resposta.getTime() - criacao.getTime())
      }, 0) / (mensagens.filter((m: any) => m.respostas && m.respostas.length > 0).length || 1) / (1000 * 60 * 60) // em horas
  } : {
    totalMensagens: 0,
    naoRespondidas: 0,
    mensagensHoje: 0,
    tempoMedioResposta: 0
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Mensagens"
            description="Gerencie as mensagens do seu espaço"
          />
          <Button onClick={() => setModalAberto(true)}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Nova Mensagem
          </Button>
          
          <NovaMensagemEspacoModal 
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
            <h3 className="font-semibold text-sm text-muted-foreground">Não Respondidas</h3>
            <p className="text-2xl font-bold">{stats.naoRespondidas}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Mensagens Hoje</h3>
            <p className="text-2xl font-bold">{stats.mensagensHoje}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Tempo Médio de Resposta</h3>
            <p className="text-2xl font-bold">{stats.tempoMedioResposta.toFixed(1)}h</p>
          </div>
        </div>

        <Separator />
        <DataTable
          columns={columns}
          data={mensagens || []}
          searchKey="usuario"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
