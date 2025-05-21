'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MoreHorizontal, Star, MessageSquare, Flag } from 'lucide-react'
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
    accessorKey: 'estrelas',
    header: 'Avaliação',
    cell: ({ row }) => {
      const estrelas = row.getValue('estrelas') as number
      return (
        <div className="flex items-center gap-1">
          <span className="font-bold mr-1">{estrelas}</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < estrelas ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: 'comentario',
    header: 'Comentário',
    cell: ({ row }) => {
      const comentario = row.getValue('comentario') as string
      return (
        <p className="max-w-[300px] truncate">{comentario}</p>
      )
    },
  },
  // Removendo coluna de tipo de reserva que não existe no modelo de avaliação
  {
    accessorKey: 'createdAt',
    header: 'Data',
    cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'PPP', { locale: ptBR }),
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
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              Responder
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Flag className="mr-2 h-4 w-4" />
              Reportar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
