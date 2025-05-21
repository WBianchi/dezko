import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  { params }: { params: { categoriaId: string } }
) {
  try {
    const { categoriaId } = params

    await prisma.categoriaEspaco.delete({
      where: {
        id: categoriaId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CATEGORIA_DELETE]", error)
    return new NextResponse("Erro ao excluir categoria", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { categoriaId: string } }
) {
  try {
    const { categoriaId } = params
    const body = await req.json()
    const { nome, descricao, icone } = body

    // Gera o slug a partir do nome
    const slug = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")

    const categoria = await prisma.categoriaEspaco.update({
      where: {
        id: categoriaId,
      },
      data: {
        nome,
        descricao,
        icone,
        slug,
      },
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error("[CATEGORIA_PATCH]", error)
    return new NextResponse("Erro ao atualizar categoria", { status: 500 })
  }
}
