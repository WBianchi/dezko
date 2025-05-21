import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nome, descricao, icone } = body

    // Gera o slug a partir do nome
    const slug = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")

    const categoria = await prisma.categoriaEspaco.create({
      data: {
        nome,
        slug,
        descricao,
        icone,
      },
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error("[CATEGORIAS_POST]", error)
    return new NextResponse("Erro ao criar categoria", { status: 500 })
  }
}

export async function GET() {
  try {
    const categorias = await prisma.categoriaEspaco.findMany({
      orderBy: {
        nome: "asc",
      },
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error("[CATEGORIAS_GET]", error)
    return new NextResponse("Erro ao buscar categorias", { status: 500 })
  }
}
