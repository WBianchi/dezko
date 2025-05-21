'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MoreHorizontal, Eye, FileText } from 'lucide-react'
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
  },
  {
    accessorKey: 'reserva',
    header: 'Tipo de Reserva',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.reserva.agenda.tipoReserva}
      </Badge>
    ),
  },
  {
    accessorKey: 'valor',
    header: 'Valor Total',
    cell: ({ row }) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(row.original.valor),
  },
  {
    accessorKey: 'valorLiquido',
    header: 'Valor Líquido',
    cell: ({ row }) => {
      const valor = row.original.valor
      const valorLiquido = valor * 0.9 // 90% do valor (10% é a comissão)
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valorLiquido)
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      let color = ''
      let label = ''

      switch (status.toLowerCase()) {
        case 'approved':
        case 'pago':
          color = 'bg-green-500'
          label = 'Pago'
          break
        case 'pending':
        case 'pendente':
          color = 'bg-yellow-500'
          label = 'Pendente'
          break
        case 'in_process':
        case 'em_processo':
          color = 'bg-blue-500'
          label = 'Em Processamento'
          break
        case 'rejected':
        case 'rejeitado':
          color = 'bg-red-500'
          label = 'Rejeitado'
          break
        case 'cancelled':
        case 'cancelado':
          color = 'bg-gray-500'
          label = 'Cancelado'
          break
        default:
          color = 'bg-gray-500'
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
    accessorKey: 'formaPagamento',
    header: 'Forma de Pagamento',
    cell: ({ row }) => {
      const formaPagamento = row.getValue('formaPagamento') as string
      
      if (formaPagamento === 'PIX') {
        return <Badge variant="outline">PIX</Badge>
      } else if (formaPagamento === 'CARTAO') {
        return <Badge variant="outline">Cartão</Badge>
      }
      
      return <Badge variant="outline">{formaPagamento}</Badge>
    },
  },
  {
    accessorKey: 'gateway',
    header: 'Gateway',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.getValue('gateway').toUpperCase()}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Data',
    cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'PPP', { locale: ptBR }),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const pagamento = row.original

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
              <FileText className="mr-2 h-4 w-4" />
              Comprovante
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
