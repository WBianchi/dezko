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
import { Eye, Trash2, MoreHorizontal, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { toast } from "sonner"
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export type Pagina = {
  id: string
  titulo: string
  slug: string
  status: 'RASCUNHO' | 'PUBLICADA'
  autor: string
  template: string
  createdAt: string
  updatedAt: string
  path?: string
}

// Componente de ações para cada página
const ActionCell = ({ pagina }: { pagina: Pagina }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const onDelete = async () => {
    try {
      setIsDeleting(true)
      // Aqui poderia ter uma chamada para a API para deletar a página
      // await fetch(`/api/admin/paginas/${pagina.id}`, { method: 'DELETE' })
      
      // Por enquanto apenas simula a deleção
      toast.success(`Página ${pagina.titulo} deletada com sucesso!`)
    } catch (error) {
      toast.error("Ocorreu um erro ao deletar a página")
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href={pagina.slug} target="_blank">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            Ver
          </Button>
        </Link>
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setShowDeleteAlert(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Deletar
        </Button>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar permanentemente a página 
              <span className="font-bold"> {pagina.titulo}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const columns: ColumnDef<Pagina>[] = [
  {
    accessorKey: 'titulo',
    header: 'Título',
  },
  {
    accessorKey: 'slug',
    header: 'URL',
    cell: ({ row }) => {
      const slug = row.getValue('slug') as string
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="truncate max-w-[150px]">{slug}</span>
          <Link href={slug} target="_blank">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-primary cursor-pointer" />
          </Link>
        </div>
      )
    }
  },
  {
    accessorKey: 'template',
    header: 'Template',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={status === 'PUBLICADA' ? 'secondary' : 'default'}
          className={status === 'PUBLICADA' ? 'bg-green-500 hover:bg-green-500/90' : ''}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => {
      const pagina = row.original
      return <ActionCell pagina={pagina} />
    },
  },
]
