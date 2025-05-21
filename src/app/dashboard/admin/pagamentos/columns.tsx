"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Redo } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditCard } from "lucide-react"

export type Payment = {
  id: string
  reservaId: string
  usuario: string
  espaco: string
  valor: string
  status: string
  gateway: string
  gatewayId: string
  formaPagamento: string
  tipo: string
  createdAt: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    )
  },
  {
    accessorKey: "tipo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string
      return (
        <Badge className={tipo === "agenda" ? "bg-blue-500 text-white" : "bg-purple-500 text-white"}>
          {tipo === "agenda" ? "Agenda" : "Assinatura"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
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
    accessorKey: "valor",
    header: "Valor Total",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("valor"))
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(valor)
    }
  },
  {
    accessorKey: "comissao",
    header: "Comissão (10%)",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("valor"))
      const comissao = valor * 0.1 // 10% de comissão
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(comissao)
    }
  },
  {
    accessorKey: "formaPagamento",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Forma de Pagamento" />
    ),
    cell: ({ row }) => {
      const formaPagamento = row.getValue("formaPagamento") as string
      
      return (
        <div className="flex items-center">
          {formaPagamento === "PIX" ? (
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              PIX
            </span>
          ) : formaPagamento === "CARTAO" ? (
            <span className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Cartão de Crédito
            </span>
          ) : (
            formaPagamento
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let color = ""
      let label = ""
      
      switch (status.toLowerCase()) {
        case "approved":
        case "pago":
          color = "bg-green-500"
          label = "Pago"
          break
        case "pending":
        case "pendente":
          color = "bg-yellow-500"
          label = "Pendente"
          break
        case "in_process":
        case "em_processo":
          color = "bg-blue-500"
          label = "Em Processo"
          break
        case "rejected":
        case "rejeitado":
          color = "bg-red-500"
          label = "Rejeitado"
          break
        case "cancelled":
        case "cancelado":
          color = "bg-gray-500"
          label = "Cancelado"
          break
        case "refunded":
        case "reembolsado":
          color = "bg-purple-500"
          label = "Reembolsado"
          break
        default:
          color = "bg-gray-500"
          label = status
      }

      return (
        <Badge className={`${color} text-white`}>
          {label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: "gateway",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gateway" />
    ),
    cell: ({ row }) => {
      const gateway = row.getValue("gateway") as string
      return gateway.toUpperCase()
    }
  },
  {
    accessorKey: "gatewayId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID Gateway" />
    )
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data" />
    )
  },
  {
    id: "actions",
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
              Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Redo className="mr-2 h-4 w-4" />
              Reprocessar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
