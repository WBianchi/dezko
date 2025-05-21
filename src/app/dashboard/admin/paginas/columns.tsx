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
import { MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type Pagina = {
  id: string
  titulo: string
  slug: string
  status: 'RASCUNHO' | 'PUBLICADA'
  autor: string
  template: string
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<Pagina>[] = [
  {
    accessorKey: 'titulo',
    header: 'Título',
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'template',
    header: 'Template',
  },
  {
    accessorKey: 'autor',
    header: 'Autor',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={status === 'PUBLICADA' ? 'success' : 'default'}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Atualizada em',
    cell: ({ row }) => {
      const date = row.getValue('updatedAt') as string
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const pagina = row.original

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
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Visualizar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Publicar</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
