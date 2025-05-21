import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function TagsPage() {
  return (
    <div className="flex-col flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Tags"
          description="Gerencie as tags do blog"
        />
        <Link href="/dashboard/admin/tags/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tag
          </Button>
        </Link>
      </div>
      <Separator />
      <DataTable columns={columns} data={[]} />
    </div>
  )
}
