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

export type Saque = {
  id: string
  espacoId: string
  espacoNome: string
  valor: number
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO'
  createdAt: string
  metodoPagamento: string
  contaBancaria: string
}

export const columns: ColumnDef<Saque>[] = [
  {
    accessorKey: 'espacoNome',
    header: 'Espaço',
  },
  {
    accessorKey: 'valor',
    header: 'Valor',
    cell: ({ row }) => {
      const valor = row.getValue('valor') as number
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: 'metodoPagamento',
    header: 'Método',
  },
  {
    accessorKey: 'contaBancaria',
    header: 'Conta',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={
            status === 'APROVADO'
              ? 'success'
              : status === 'REJEITADO'
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
      const saque = row.original

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
