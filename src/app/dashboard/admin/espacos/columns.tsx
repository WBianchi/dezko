'use client'

import { ColumnDef } from '@tanstack/react-table'
import { CellAction } from './cell-action'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type EspacoColumn = {
  id: string
  nome: string
  email: string
  createdAt: Date
  statusAssinatura: string
  planoNome: string
  planoTipo: string
  dataInicio: Date | null
  dataExpiracao: Date | null
}

export const columns: ColumnDef<EspacoColumn>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    cell: ({ row }) => {
      const nome: string = row.getValue('nome')
      const email: string = row.getValue('email')

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${nome}`} />
            <AvatarFallback>
              {nome
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{nome}</span>
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'statusAssinatura',
    header: 'Status da Assinatura',
    cell: ({ row }) => {
      const status: string = row.getValue('statusAssinatura')
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'ATIVA':
            return 'bg-green-100 text-green-800'
          case 'PENDENTE':
            return 'bg-yellow-100 text-yellow-800'
          case 'CANCELADA':
            return 'bg-red-100 text-red-800'
          case 'EXPIRADA':
            return 'bg-gray-100 text-gray-800'
          default:
            return 'bg-gray-100 text-gray-600'
        }
      }
      
      return (
        <div className="flex items-center">
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'planoNome',
    header: 'Plano',
    cell: ({ row }) => {
      const planoNome: string = row.getValue('planoNome')
      
      return (
        <div className="flex flex-col">
          <span className="font-medium">{planoNome}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'dataInicio',
    header: 'Data de Início',
    cell: ({ row }) => {
      const date = row.getValue('dataInicio') as Date
      if (!date) return <div>-</div>
      
      const formatted = format(new Date(date), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: 'dataExpiracao',
    header: 'Data de Expiração',
    cell: ({ row }) => {
      const date = row.getValue('dataExpiracao') as Date
      if (!date) return <div>-</div>
      
      const hoje = new Date()
      const dataExp = new Date(date)
      const estahExpirado = hoje > dataExp
      
      const formatted = format(dataExp, "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })

      return (
        <div className={estahExpirado ? 'text-red-600' : ''}>
          {formatted}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Data de Cadastro',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      const formatted = format(new Date(date), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })

      return <div>{formatted}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
