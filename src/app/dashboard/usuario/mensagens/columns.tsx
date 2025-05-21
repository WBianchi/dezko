'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MoreHorizontal, MessageSquare, Archive, Star } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'espaco',
    header: 'Espaço',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          {row.original.espaco.nome[0].toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{row.original.espaco.nome}</p>
          <p className="text-sm text-muted-foreground">{row.original.espaco.endereco}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'assunto',
    header: 'Assunto',
  },
  {
    accessorKey: 'mensagem',
    header: 'Mensagem',
    cell: ({ row }) => {
      const mensagem = row.getValue('mensagem') as string
      return (
        <p className="max-w-[300px] truncate">{mensagem}</p>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      // Verificamos se o campo lida existe, senão assumimos false
      const lida = row.original.lida !== undefined ? row.original.lida : false
      return (
        <Badge className={lida ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
          {lida ? 'Lida' : 'Não lida'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'respostas',
    header: 'Resposta',
    cell: ({ row }) => {
      const respostas = row.original.respostas || []
      const temResposta = respostas.length > 0
      return temResposta ? (
        <Badge variant="outline" className="bg-blue-100">Respondida</Badge>
      ) : null
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Data',
    cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'PPP HH:mm', { locale: ptBR }),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const mensagem = row.original
      
      const handleResponder = async () => {
        // Abrir modal de resposta ou redirecionar para página detalhada
        alert(`Responder à mensagem: ${mensagem.id}`)
        // Aqui você pode implementar a lógica para abrir um modal de resposta
      }
      
      const handleMarcarImportante = async () => {
        try {
          const response = await fetch(`/api/usuario/mensagens/${mensagem.id}/importante`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            toast.success('Mensagem marcada como importante')
            // Atualizar a lista de mensagens
            window.location.reload()
          } else {
            toast.error('Erro ao marcar mensagem como importante')
          }
        } catch (error) {
          console.error('Erro:', error)
          toast.error('Erro ao processar sua solicitação')
        }
      }
      
      const handleArquivar = async () => {
        try {
          const response = await fetch(`/api/usuario/mensagens/${mensagem.id}/arquivar`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            toast.success('Mensagem arquivada com sucesso')
            // Atualizar a lista de mensagens
            window.location.reload()
          } else {
            toast.error('Erro ao arquivar mensagem')
          }
        } catch (error) {
          console.error('Erro:', error)
          toast.error('Erro ao processar sua solicitação')
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleResponder}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Responder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMarcarImportante}>
              <Star className="mr-2 h-4 w-4" />
              Marcar como Importante
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArquivar}>
              <Archive className="mr-2 h-4 w-4" />
              Arquivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
