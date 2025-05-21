'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { columns } from './columns'
import { useQuery } from '@tanstack/react-query'
import { AddEspacoModal } from '@/components/modals/add-espaco-modal'
import { useState } from 'react'

export default function EspacosPage() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data: espacos, refetch } = useQuery({
    queryKey: ['espacos'],
    queryFn: async () => {
      const response = await fetch('/api/admin/espacos')
      const data = await response.json()
      return data
    },
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Espaços"
            description="Gerencie os espaços cadastrados no sistema"
          />
          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Adicionar Espaço
          </Button>
        </div>
        <Separator />
        <DataTable
          columns={columns}
          data={espacos || []}
          searchKey="nome"
          loading={loading}
        />
      </div>
      <AddEspacoModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => refetch()}
      />
    </div>
  )
}
