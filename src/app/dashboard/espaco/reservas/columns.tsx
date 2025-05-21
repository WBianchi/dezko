'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MoreHorizontal, Eye, MessageSquare } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'usuario',
    header: 'Cliente',
  },
  {
    accessorKey: 'agenda',
    header: 'Tipo',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.agenda.tipoReserva}
      </Badge>
    ),
  },
  {
    accessorKey: 'dataInicio',
    header: 'Data Início',
    cell: ({ row }) => format(row.original.dataInicio, 'PPP HH:mm', { locale: ptBR }),
  },
  {
    accessorKey: 'dataFim',
    header: 'Data Fim',
    cell: ({ row }) => format(row.original.dataFim, 'PPP HH:mm', { locale: ptBR }),
  },
  {
    accessorKey: 'valor',
    header: 'Valor',
    cell: ({ row }) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(row.original.valor),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      let color = ""
      let label = ""
      
      switch (status.toLowerCase()) {
        case "confirmada":
          color = "bg-green-500"
          label = "Confirmada"
          break
        case "pendente":
          color = "bg-yellow-500"
          label = "Pendente"
          break
        case "cancelada":
          color = "bg-red-500"
          label = "Cancelada"
          break
        default:
          color = "bg-gray-500"
          label = status
      }

      return (
        <Badge className={`${color} text-white`}>
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Data da Reserva',
    cell: ({ row }) => format(row.original.createdAt, 'PPP', { locale: ptBR }),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const reserva = row.original

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
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              Enviar Mensagem
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
