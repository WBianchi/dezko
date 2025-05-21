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

export type Split = {
  id: string
  espacoId: string
  espacoNome: string
  percentualEspaco: number
  percentualPlataforma: number
  contaMercadoPago: string
  status: 'ATIVO' | 'INATIVO'
}

export const columns: ColumnDef<Split>[] = [
  {
    accessorKey: 'espacoNome',
    header: 'Espaço',
  },
  {
    accessorKey: 'percentualEspaco',
    header: '% Espaço',
    cell: ({ row }) => {
      const percentual = row.getValue('percentualEspaco') as number
      return <div className="font-medium">{percentual}%</div>
    },
  },
  {
    accessorKey: 'percentualPlataforma',
    header: '% Plataforma',
    cell: ({ row }) => {
      const percentual = row.getValue('percentualPlataforma') as number
      return <div className="font-medium">{percentual}%</div>
    },
  },
  {
    accessorKey: 'contaMercadoPago',
    header: 'Conta MP',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={status === 'ATIVO' ? 'success' : 'destructive'}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const split = row.original

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
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ativar</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Desativar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
