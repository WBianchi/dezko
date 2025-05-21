import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categoriaId = searchParams.get('categoriaId')
    
    // Filtrar por categoria se o ID for fornecido
    const subcategorias = await prisma.subCategoriaEspaco.findMany({
      where: categoriaId ? { categoriaId } : undefined,
      orderBy: {
        nome: "asc",
      },
    })

    return NextResponse.json(subcategorias)
  } catch (error) {
    console.error("[SUBCATEGORIAS_GET]", error)
    return new NextResponse("Erro ao buscar subcategorias", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nome, descricao, icone, categoriaId } = body

    // Validar dados
    if (!nome || !categoriaId) {
      return new NextResponse("Nome e categoriaId são obrigatórios", { status: 400 })
    }

    // Gera o slug a partir do nome
    const slug = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")

    // Verificar se a categoria existe
    const categoria = await prisma.categoriaEspaco.findUnique({
      where: { id: categoriaId }
    })

    if (!categoria) {
      return new NextResponse("Categoria não encontrada", { status: 404 })
    }

    // Criar subcategoria
    const subcategoria = await prisma.subCategoriaEspaco.create({
      data: {
        nome,
        slug,
        descricao,
        icone,
        categoriaId,
      },
    })

    return NextResponse.json(subcategoria)
  } catch (error) {
    console.error("[SUBCATEGORIAS_POST]", error)
    return new NextResponse("Erro ao criar subcategoria", { status: 500 })
  }
}
