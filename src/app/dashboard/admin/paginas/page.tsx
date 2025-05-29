import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'
import { Pagina, columns } from './columns'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

async function getPaginas() {
  try {
    // Busca as páginas da API com cache desativado para sempre ter dados atualizados
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/admin/paginas`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    
    if (!res.ok) {
      throw new Error('Falha ao buscar páginas')
    }
    
    return res.json()
  } catch (error) {
    console.error('Erro ao buscar páginas:', error)
    return []
  }
}

function PaginasLoading() {
  return (
    <div className="flex items-center justify-center w-full h-48">
      <div className="flex items-center space-x-2">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Carregando páginas...</p>
      </div>
    </div>
  )
}

async function PaginasContent() {
  const paginas: Pagina[] = await getPaginas()
  
  return (
    <DataTable 
      columns={columns} 
      data={paginas} 
      searchKey="titulo"
    />
  )
}

export default function PaginasPage() {
  return (
    <div className="flex-col flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Páginas"
          description="Gerencie as páginas do site"
        />
        <Link href="/dashboard/admin/paginas/nova">
        
        </Link>
      </div>
      <Separator />
      <Suspense fallback={<PaginasLoading />}>
        <PaginasContent />
      </Suspense>
    </div>
  )
}
