'use client'

import { ColumnDef } from '@tanstack/react-table'
import { CellAction } from './cell-action'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type AgendaColumn = {
  id: string
  titulo: string
  tipoReserva: 'HORA' | 'TURNO' | 'DIA'
  dataInicio: Date
  dataFim: Date
  categoria: string
  valorHora?: number
  valorTurno?: number
  valorDia?: number
}

export const columns: ColumnDef<AgendaColumn>[] = [
  {
    accessorKey: 'titulo',
    header: 'Título',
  },
  {
    accessorKey: 'tipoReserva',
    header: 'Tipo de Reserva',
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.tipoReserva === 'HORA'
            ? 'default'
            : row.original.tipoReserva === 'TURNO'
            ? 'secondary'
            : 'outline'
        }
      >
        {row.original.tipoReserva === 'HORA'
          ? 'Por Hora'
          : row.original.tipoReserva === 'TURNO'
          ? 'Por Turno'
          : 'Por Dia'}
      </Badge>
    ),
  },
  {
    accessorKey: 'dataInicio',
    header: 'Início',
    cell: ({ row }) => format(row.original.dataInicio, 'PPP', { locale: ptBR }),
  },
  {
    accessorKey: 'dataFim',
    header: 'Fim',
    cell: ({ row }) => format(row.original.dataFim, 'PPP', { locale: ptBR }),
  },
  {
    accessorKey: 'categoria',
    header: 'Categoria',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.categoria === 'COWORKING'
          ? 'Coworking'
          : row.original.categoria === 'SALA_REUNIAO'
          ? 'Sala de Reunião'
          : row.original.categoria === 'AUDITORIO'
          ? 'Auditório'
          : 'Estúdio'}
      </Badge>
    ),
  },
  {
    accessorKey: 'valor',
    header: 'Valor',
    cell: ({ row }) => {
      const valor =
        row.original.tipoReserva === 'HORA'
          ? row.original.valorHora
          : row.original.tipoReserva === 'TURNO'
          ? row.original.valorTurno
          : row.original.valorDia

      return valor?.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
