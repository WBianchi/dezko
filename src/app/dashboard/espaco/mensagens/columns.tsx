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
    accessorKey: 'usuario',
    header: 'Cliente',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          {row.original.usuario.nome[0].toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{row.original.usuario.nome}</p>
          <p className="text-sm text-muted-foreground">{row.original.usuario.email}</p>
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
      const respondida = row.original.respondida
      return (
        <Badge className={respondida ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
          {respondida ? 'Respondida' : 'Pendente'}
        </Badge>
      )
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
        try {
          // Abrir modal de resposta
          const resposta = prompt('Digite sua resposta para esta mensagem:')
          
          if (!resposta) return
          
          const response = await fetch(`/api/espaco/mensagens/${mensagem.id}/responder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ resposta }),
          })
          
          if (response.ok) {
            toast.success('Mensagem respondida com sucesso')
            // Atualizar a lista de mensagens
            window.location.reload()
          } else {
            toast.error('Erro ao responder a mensagem')
          }
        } catch (error) {
          console.error('Erro:', error)
          toast.error('Erro ao processar sua solicitação')
        }
      }
      
      const handleMarcarImportante = async () => {
        try {
          const response = await fetch(`/api/espaco/mensagens/${mensagem.id}/importante`, {
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
          const response = await fetch(`/api/espaco/mensagens/${mensagem.id}/arquivar`, {
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
