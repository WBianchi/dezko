import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function preserveImages() {
  console.log('Iniciando preservação de imagens...')
  
  try {
    // Buscar todos os espaços que possuem imagens
    const espacos = await prisma.espaco.findMany({
      where: {
        imagens: {
          isEmpty: false
        }
      },
      select: {
        id: true,
        imagens: true
      }
    })
    
    console.log(`Encontrados ${espacos.length} espaços com imagens para preservar`)
    
    // Para cada espaço, armazenar a primeira imagem como fotoPrincipal e as demais como galeria
    for (const espaco of espacos) {
      console.log(`Processando espaço ID: ${espaco.id} com ${espaco.imagens.length} imagens`)
      
      // Define a primeira imagem como fotoPrincipal e a segunda como fotoCapa (se existirem)
      const fotoPrincipal = espaco.imagens[0] || ''
      const fotoCapa = espaco.imagens[1] || espaco.imagens[0] || ''
      
      // O restante vai para a galeria (ou toda a lista, se não houver muitas imagens)
      const galeria = espaco.imagens.length > 2 
        ? espaco.imagens.slice(2) 
        : [...espaco.imagens]
      
      // Atualiza o espaço com os novos campos
      await prisma.espaco.update({
        where: { id: espaco.id },
        data: {
          fotoPrincipal,
          fotoCapa,
          galeria
        }
      })
      
      console.log(`✅ Espaço ID: ${espaco.id} atualizado com sucesso!`)
    }
    
    console.log('Preservação de imagens concluída com sucesso!')
  } catch (error) {
    console.error('Erro ao preservar imagens:', error)
  } finally {
    await prisma.$disconnect()
  }
}

preserveImages()
  .then(() => console.log('Script finalizado.'))
  .catch(e => console.error('Erro no script:', e))
