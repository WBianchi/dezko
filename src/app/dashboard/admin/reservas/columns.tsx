"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Reserva = {
  id: string
  dataInicio: string
  dataFim: string
  statusPedido: "CONFIRMADA" | "PENDENTE" | "CANCELADA"
  valor: number
  usuario: {
    nome: string
    email: string
  }
  espaco: {
    nome: string
  }
}

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    )
  },
  {
    accessorKey: "usuario",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usuário" />
    )
  },
  {
    accessorKey: "espaco",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Espaço" />
    )
  },
  {
    accessorKey: "dataInicio",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data/Hora Início" />
    )
  },
  {
    accessorKey: "dataFim",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data/Hora Fim" />
    )
  },
  {
    accessorKey: "valor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("valor"))
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(valor)
    }
  },
  {
    accessorKey: "statusPedido",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("statusPedido") as string
      let color = ""
      
      switch (status.toLowerCase()) {
        case "confirmada":
          color = "bg-green-500"
          break
        case "pendente":
          color = "bg-yellow-500"
          break
        case "cancelada":
          color = "bg-red-500"
          break
        default:
          color = "bg-gray-500"
      }

      return (
        <Badge className={`${color} text-white`}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: "agenda",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agenda" />
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const reserva = row.original

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
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
