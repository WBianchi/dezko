import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    console.log("[ESPACOS_GET] Iniciando busca de espaços...")
    const { searchParams } = new URL(req.url)
    console.log("[ESPACOS_GET] URL params:", Object.fromEntries(searchParams.entries()))
    
    const estado = searchParams.get("estado")
    const cidade = searchParams.get("cidade")
    const categoria = searchParams.get("categoria")
    const precoMin = searchParams.get("precoMin") ? Number(searchParams.get("precoMin")) : undefined
    const precoMax = searchParams.get("precoMax") ? Number(searchParams.get("precoMax")) : undefined
    const capacidadeMin = searchParams.get("capacidadeMin") ? Number(searchParams.get("capacidadeMin")) : undefined
    const capacidadeMax = searchParams.get("capacidadeMax") ? Number(searchParams.get("capacidadeMax")) : undefined
    const apenasDisponiveis = searchParams.get("apenasDisponiveis") !== "false" // padrão true
    
    console.log("[ESPACOS_GET] Parâmetros processados:", {
      estado, cidade, categoria, precoMin, precoMax, capacidadeMin, capacidadeMax, apenasDisponiveis
    })

    // Construir os filtros dinamicamente
    const where: any = {};
    
    // Filtros de texto usando equals para comparação exata
    if (estado) where.estado = { equals: estado.toString() };
    if (cidade) where.cidade = { equals: cidade.toString() };
    if (categoria) where.categoriaId = categoria;
    
    console.log("[ESPACOS_GET] Filtrando por estado:", estado, "cidade:", cidade);
    
    // Adiciona o filtro de status
    if (apenasDisponiveis) where.status = "ativo";
    
    // Filtro de preço só se tiver precoMin ou precoMax
    if (precoMin !== undefined || precoMax !== undefined) {
      where.agendas = {
        some: {
          AND: []
        }
      };
      
      if (precoMin !== undefined) {
        where.agendas.some.AND.push({ valorDia: { gte: precoMin } });
      }
      
      if (precoMax !== undefined) {
        where.agendas.some.AND.push({ valorDia: { lte: precoMax } });
      }
    }

    // Filtro de capacidade
    if (capacidadeMin !== undefined) where.capacidade = { ...(where.capacidade || {}), gte: capacidadeMin };
    if (capacidadeMax !== undefined) where.capacidade = { ...(where.capacidade || {}), lte: capacidadeMax };

    console.log("[ESPACOS_GET] Condição WHERE:", JSON.stringify(where, null, 2));
    
    const espacos = await prisma.espaco.findMany({
      where: where,
      include: {
        categorias: true,
        agendas: {
          select: {
            id: true,
            titulo: true,
            valorHora: true,
            valorTurno: true,
            valorDia: true,
          }
        }
      },
      orderBy: {
        nome: "asc"
      }
    })

    console.log("[ESPACOS_GET] Total de espaços encontrados:", espacos.length)

    // Mapear os dados para incluir a avaliação média
    const espacosComAvaliacao = await Promise.all(
      espacos.map(async (espaco) => {
        const avaliacoes = await prisma.avaliacao.findMany({
          where: { espacoId: espaco.id },
          select: { nota: true }
        })

        const mediaAvaliacoes = avaliacoes.length > 0
          ? avaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / avaliacoes.length
          : 0

        const resultado = {
          ...espaco,
          avaliacao: Number(mediaAvaliacoes.toFixed(1)),
          fotos: [espaco.fotoPrincipal, ...espaco.imagens].filter(Boolean)
        }

        return resultado
      })
    )

    console.log("[ESPACOS_GET] Concluindo processamento. Total processado:", espacosComAvaliacao.length)

    return NextResponse.json(espacosComAvaliacao)
  } catch (error) {
    console.error("[ESPACOS_GET]", error)
    return new NextResponse("Erro ao buscar espaços", { status: 500 })
  }
}
