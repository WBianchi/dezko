import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { columns } from "./columns"
import { prisma } from "@/lib/prisma"
import { ModalNovaCategoria } from "./modal-nova-categoria"

export default async function CategoriasPage() {
  const categorias = await prisma.categoriaEspaco.findMany({
    orderBy: {
      nome: 'asc'
    }
  })

  const formattedCategorias = categorias.map((categoria) => ({
    id: categoria.id,
    nome: categoria.nome,
    descricao: categoria.descricao,
    icone: categoria.icone,
    slug: categoria.slug,
  }))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Categorias de Espaços"
          description="Gerencie as categorias dos espaços disponíveis na plataforma"
        />
        <ModalNovaCategoria>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </ModalNovaCategoria>
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={formattedCategorias}
        searchKey="nome"
        searchPlaceholder="Filtrar categorias..."
      />
    </div>
  )
}
