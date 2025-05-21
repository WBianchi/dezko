import { prisma } from "@/lib/prisma"
import * as argon2 from "argon2"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Verificar se já existe um usuário com o mesmo email
    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        email: data.email
      }
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { message: "Email já cadastrado" },
        { status: 400 }
      )
    }
    
    // Verificar se já existe um usuário com o mesmo CPF
    const usuarioComCpf = await prisma.usuario.findFirst({
      where: {
        cpf: data.cpf
      }
    })
    
    if (usuarioComCpf) {
      return NextResponse.json(
        { message: "CPF já cadastrado" },
        { status: 400 }
      )
    }

    const senha = await argon2.hash(data.senha)

    // Criar o usuário com os dados do cliente
    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha,
        cpf: data.cpf,
        telefone: data.telefone,
      }
    })

    return NextResponse.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    })
  } catch (error) {
    console.error("[CADASTRO_CLIENTE]", error)
    return NextResponse.json(
      { message: "Erro ao cadastrar cliente" },
      { status: 500 }
    )
  }
}
