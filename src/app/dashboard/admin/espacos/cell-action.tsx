'use client'

import { useState } from 'react'
import { Edit, MoreHorizontal, Trash } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AlertModal } from '@/components/modals/alert-modal'
import { AddEspacoModal } from '@/components/modals/add-espaco-modal'

import { EspacoColumn } from './columns'
import { useQueryClient } from '@tanstack/react-query'

interface CellActionProps {
  data: EspacoColumn
}

export function CellAction({ data }: CellActionProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const queryClient = useQueryClient()

  const onConfirm = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/espacos/${data.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir espaço')
      }

      toast.success('Espaço excluído com sucesso')
      queryClient.invalidateQueries({ queryKey: ['espacos'] })
    } catch (error) {
      toast.error('Algo deu errado')
    } finally {
      setOpen(false)
      setLoading(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <AddEspacoModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onConfirm={() => queryClient.invalidateQueries({ queryKey: ['espacos'] })}
        initialData={data}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
