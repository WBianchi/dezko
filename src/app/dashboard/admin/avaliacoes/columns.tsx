'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type Avaliacao = {
  id: string
  usuarioId: string
  usuarioNome: string
  espacoId: string
  espacoNome: string
  nota: number
  comentario: string
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA'
  createdAt: string
}

export const columns: ColumnDef<Avaliacao>[] = [
  {
    accessorKey: 'usuarioNome',
    header: 'Usuário',
  },
  {
    accessorKey: 'espacoNome',
    header: 'Espaço',
  },
  {
    accessorKey: 'nota',
    header: 'Nota',
    cell: ({ row }) => {
      const nota = row.getValue('nota') as number
      return (
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-500 mr-1" />
          <span>{nota}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'comentario',
    header: 'Comentário',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={
            status === 'APROVADA'
              ? 'success'
              : status === 'REJEITADA'
              ? 'destructive'
              : 'default'
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Data',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const avaliacao = row.original

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
            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Aprovar</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Rejeitar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
