'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MoreHorizontal, Eye, FileText, ExternalLink } from 'lucide-react'
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
    cell: ({ row }) => {
      const reserva = row.original.reserva;
      return reserva && reserva.espaco ? (
        <div>
          <p className="font-medium">{reserva.espaco.nome}</p>
          <p className="text-xs text-muted-foreground">{reserva.espaco.endereco}</p>
        </div>
      ) : (
        <span className="text-muted-foreground">Não disponível</span>
      );
    },
  },
  {
    accessorKey: 'reserva',
    header: 'Tipo de Reserva',
    cell: ({ row }) => {
      const tipoReserva = row.original.reserva?.tipoReserva;
      return tipoReserva ? (
        <Badge variant="outline">{tipoReserva}</Badge>
      ) : (
        <Badge variant="outline">Avulsa</Badge>
      );
    },
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
    accessorKey: 'gateway',
    header: 'Forma de Pagamento',
    cell: ({ row }) => {
      const gateway = row.getValue('gateway') as string
      
      if (gateway === 'mercadopago') {
        return <Badge variant="outline">MercadoPago</Badge>
      } else if (gateway === 'pix') {
        return <Badge variant="outline">PIX</Badge>
      } else if (gateway === 'cartao') {
        return <Badge variant="outline">Cartão</Badge>
      }
      
      return <Badge variant="outline">{gateway || 'Não informado'}</Badge>
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Data',
    cell: ({ row }) => {
      const dataPagamento = row.original.dataPagamento || row.original.createdAt;
      return format(new Date(dataPagamento), 'dd/MM/yyyy', { locale: ptBR });
    },
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
            {(pagamento.status?.toLowerCase() === 'pendente' || pagamento.status?.toLowerCase() === 'pending') && (
              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                Pagar Agora
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
