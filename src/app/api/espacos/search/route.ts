import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Obter o termo de busca da URL
    const { searchParams } = new URL(request.url)
    const term = searchParams.get('term')

    if (!term) {
      return NextResponse.json({ error: 'Termo de busca não fornecido' }, { status: 400 })
    }

    console.log(`[API] Buscando espaços com o termo: ${term}`)

    // Buscar os espaços que correspondem ao termo de busca
    const espacos = await prisma.espaco.findMany({
      where: {
        OR: [
          { nome: { contains: term, mode: 'insensitive' } },
          { descricao: { contains: term, mode: 'insensitive' } },
          { cidade: { contains: term, mode: 'insensitive' } },
          { estado: { contains: term, mode: 'insensitive' } },
        ],
        // Somente espaços ativos
        status: 'ativo'
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        cidade: true,
        estado: true,
        fotoCapa: true,
        fotoPrincipal: true,
        // Simplificando para evitar erros de tipos
        agendas: {
          select: {
            valorDia: true
          },
          take: 1,
          orderBy: {
            valorDia: 'asc'
          }
        }
      },
      take: 5, // Limitar para 5 resultados
      orderBy: {
        nome: 'asc'
      }
    })

    // Formatar os resultados
    const resultados = espacos.map(espaco => {
      // Extrair preço mínimo se existir
      const precoMinimo = espaco.agendas.length > 0 && espaco.agendas[0].valorDia
        ? espaco.agendas[0].valorDia
        : null

      return {
        id: espaco.id,
        nome: espaco.nome,
        descricao: espaco.descricao || 'Sem descrição',
        cidade: espaco.cidade || 'Não informada',
        estado: espaco.estado || 'Não informado',
        fotoPrincipal: espaco.fotoCapa || espaco.fotoPrincipal || '',
        preco: precoMinimo
      }
    })

    console.log(`[API] Encontrados ${resultados.length} espaços`)
    
    return NextResponse.json(resultados)
  } catch (error) {
    console.error('[API] Erro ao buscar espaços:', error)
    return NextResponse.json(
      { error: 'Erro ao processar a busca de espaços' },
      { status: 500 }
    )
  }
}
