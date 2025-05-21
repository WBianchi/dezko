import { prisma } from "@/lib/prisma"
import * as argon2 from "argon2"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const espacoExistente = await prisma.espaco.findFirst({
      where: {
        OR: [
          { email: data.email },
          { cnpj: data.cnpj }
        ]
      }
    })

    if (espacoExistente) {
      if (espacoExistente.email === data.email) {
        return NextResponse.json(
          { message: "Email já cadastrado" },
          { status: 400 }
        )
      }
      if (espacoExistente.cnpj === data.cnpj) {
        return NextResponse.json(
          { message: "CNPJ já cadastrado" },
          { status: 400 }
        )
      }
    }

    const senha = await argon2.hash(data.senha)

    // Obter um admin para associar ao espaço (usamos o primeiro admin disponível)
    const admin = await prisma.admin.findFirst()
    
    if (!admin) {
      return NextResponse.json(
        { message: "Não foi possível cadastrar o espaço. Nenhum administrador disponível." },
        { status: 500 }
      )
    }
    
    // Criar usuário e espaço em uma única transação
    const result = await prisma.$transaction(async (prisma) => {
      // Criar o usuário primeiro
      const usuario = await prisma.usuario.create({
        data: {
          nome: data.nome,
          email: data.email,
          senha,
        },
      })

      // Criar o espaço associado ao usuário e ao admin
      const espaco = await prisma.espaco.create({
        data: {
          nome: data.nome,
          email: data.email,
          senha,
          telefone: data.telefone,
          cnpj: data.cnpj,
          endereco: data.endereco,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
          adminId: admin.id, // Associar ao admin
          usuarios: {
            connect: {
              id: usuario.id // Associar ao usuário criado
            }
          }
        },
      })

      return { usuario, espaco }
    })

    return NextResponse.json({
      id: result.espaco.id,
      nome: result.espaco.nome,
      email: result.espaco.email,
      userId: result.usuario.id
    })
  } catch (error) {
    console.error("[CADASTRO_ESPACO]", error)
    return NextResponse.json(
      { message: "Erro ao cadastrar espaço" },
      { status: 500 }
    )
  }
}
