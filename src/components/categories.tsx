import { prisma } from "@/lib/prisma"
import { CategoriesList } from "./categories-list"

export async function Categories() {
  const categorias = await prisma.categoriaEspaco.findMany({
    orderBy: {
      nome: 'asc'
    }
  })

  return <CategoriesList categorias={categorias} />
}
