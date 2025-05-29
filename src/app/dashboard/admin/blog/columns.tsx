'use client'

import { useState } from 'react'
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
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

export interface Post {
  id: string
  titulo: string
  slug: string
  descricao?: string | null
  conteudo: string
  foto?: string | null
  status: 'RASCUNHO' | 'PUBLICADO'
  autorId: string
  autor?: {
    nome: string
  }
  pontuacaoSeo: number
  createdAt: string | Date
  updatedAt: string | Date
  categorias?: { id: string; nome: string }[]
  tags?: { id: string; nome: string }[]
  postsRelacionados?: Post[]
}

interface CellActionsProps {
  post: Post
  onEdit: (post: Post) => void
  onDelete: (postId: string) => void
}

const CellActions: React.FC<CellActionsProps> = ({ post, onEdit, onDelete }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      // Implementação futura: conexão com API para deletar o post
      // await fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' })
      
      toast.success(`Post "${post.titulo}" excluído com sucesso!`)
    } catch (error) {
      toast.error('Ocorreu um erro ao excluir o post')
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:bg-primary/10"
          onClick={() => onEdit(post)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Link href={`/blog/${post.slug}`} target="_blank">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 hover:bg-primary/10"
          >
            <Eye className="h-3.5 w-3.5" />
            Ver
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setShowDeleteAlert(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá excluir permanentemente o post
              <span className="font-bold"> {post.titulo}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const columns = [
  {
    accessorKey: 'foto',
    header: 'Imagem',
    cell: ({ row }) => {
      const post = row.original
      return (
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-100">
          {post.foto ? (
            <img 
              src={post.foto} 
              alt={post.titulo} 
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs">
              Sem imagem
            </div>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'titulo',
    header: 'Título',
    cell: ({ row }) => {
      const post = row.original
      return (
        <div className="max-w-[200px] truncate font-medium">
          {post.titulo}
        </div>
      )
    }
  },
  {
    accessorKey: 'slug',
    header: 'URL',
    cell: ({ row }) => {
      const post = row.original
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="truncate max-w-[150px]">/blog/{post.slug}</span>
          <Link href={`/blog/${post.slug}`} target="_blank">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
          </Link>
        </div>
      )
    }
  },
  {
    accessorKey: 'categorias',
    header: 'Categorias',
    cell: ({ row }) => {
      const post = row.original
      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {post.categorias && post.categorias.length > 0 ? (
            post.categorias.slice(0, 2).map((cat) => (
              <Badge key={cat.id} variant="outline" className="text-xs">
                {cat.nome}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">Sem categoria</span>
          )}
          {post.categorias && post.categorias.length > 2 && (
            <Badge variant="outline" className="text-xs">+{post.categorias.length - 2}</Badge>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const post = row.original
      return (
        <Badge
          variant={post.status === 'PUBLICADO' ? 'secondary' : 'default'}
          className={post.status === 'PUBLICADO' ? 'bg-green-500 hover:bg-green-500/90' : ''}
        >
          {post.status}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'updatedAt',
    header: 'Atualizado em',
    cell: ({ row }) => {
      const post = row.original
      return format(new Date(post.updatedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    }
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => {
      const post = row.original
      
      // Estas funções serão substituídas pela implementação real
      // quando a coluna for renderizada na página
      const mockOnEdit = (post: Post) => {
        console.log('Editar post:', post.id)
      }
      
      const mockOnDelete = (postId: string) => {
        console.log('Excluir post:', postId)
      }
      
      return (
        <CellActions 
          post={post} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      )
    }
  },
] as ColumnDef<Post>[]
