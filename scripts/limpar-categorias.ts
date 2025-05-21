import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Primeiro removemos todas as subcategorias (devido às relações)
    console.log('Removendo todas as subcategorias...')
    await prisma.$queryRaw`TRUNCATE TABLE "SubCategoriaEspaco" CASCADE`
    console.log('✅ Subcategorias removidas com sucesso!')

    // Depois removemos todas as categorias
    console.log('Removendo todas as categorias...')
    await prisma.$queryRaw`TRUNCATE TABLE "CategoriaEspaco" CASCADE`
    console.log('✅ Categorias removidas com sucesso!')

    console.log('Limpeza concluída!')
  } catch (error) {
    console.error('Erro ao limpar categorias:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => console.log('Script executado com sucesso!'))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
