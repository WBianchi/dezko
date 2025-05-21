import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function PaginasPage() {
  return (
    <div className="flex-col flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Páginas"
          description="Gerencie as páginas do site"
        />
        <Link href="/dashboard/admin/paginas/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Página
          </Button>
        </Link>
      </div>
      <Separator />
      <DataTable columns={columns} data={[]} />
    </div>
  )
}
