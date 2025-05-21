'use client'

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export type Categoria = {
  id: string
  nome: string
  descricao: string
  icone: string
  slug: string
}

export const columns: ColumnDef<Categoria>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
  },
  {
    accessorKey: "icone",
    header: "Ícone",
  },
  {
    id: "acoes",
    cell: ({ row }) => {
      const categoria = row.original
      const router = useRouter()
      const { toast } = useToast()

      const onDelete = async () => {
        try {
          const response = await fetch(`/api/categorias/${categoria.id}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error("Erro ao excluir categoria")
          }

          toast({
            title: "Categoria excluída com sucesso!",
            description: "A categoria foi removida da lista.",
          })

          router.refresh()
        } catch (error) {
          toast({
            title: "Erro ao excluir categoria",
            description: "Ocorreu um erro ao excluir a categoria. Tente novamente.",
            variant: "destructive",
          })
        }
      }

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
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/admin/categorias/${categoria.id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
