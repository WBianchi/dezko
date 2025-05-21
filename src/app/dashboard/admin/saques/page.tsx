import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

export default function SaquesPage() {
  return (
    <div className="flex-col flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Saques"
          description="Gerencie os saques dos espaços"
        />
      </div>
      <Separator />
      <DataTable columns={columns} data={[]} />
    </div>
  )
}
