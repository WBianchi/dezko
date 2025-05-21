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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type Tag = {
  id: string
  nome: string
  slug: string
  postsCount: number
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<Tag>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'postsCount',
    header: 'Posts',
    cell: ({ row }) => {
      const count = row.getValue('postsCount') as number
      return count
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
      const tag = row.original

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
            <DropdownMenuItem>Ver Posts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
