import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// Tipagem personalizada do usuário NextAuth
interface UserWithRole {
  name?: string | null
  email?: string | null
  image?: string | null
  id?: string
  role?: string
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    console.log("Session recebida na API:", session)
    const user = session.user as UserWithRole
    const userRole = user.role

    // Se o usuário é um espaço, buscamos diretamente pelo ID
    if (userRole === "espaco" && user.id) {
      const espaco = await prisma.espaco.findUnique({
        where: {
          id: user.id
        }
      })

      if (!espaco) {
        return new NextResponse("Espaço não encontrado", { status: 404 })
      }

      return NextResponse.json(espaco)
    } 
    // Se o usuário é um admin, buscamos o espaço pelo adminId
    else if (userRole === "admin") {
      // Primeiro, encontramos o admin pelo email do usuário logado
      const admin = await prisma.admin.findUnique({
        where: {
          email: session.user.email
        }
      })

      if (!admin) {
        return new NextResponse("Admin não encontrado", { status: 404 })
      }

      // Agora buscamos o espaço vinculado ao admin
      const espaco = await prisma.espaco.findFirst({
        where: {
          adminId: admin.id
        }
      })

      if (!espaco) {
        return new NextResponse("Espaço não encontrado", { status: 404 })
      }

      return NextResponse.json(espaco)
    }
    // Se não é nenhum dos casos acima, retorna erro
    else {
      return new NextResponse("Tipo de usuário não suportado", { status: 403 })
    }
  } catch (error) {
    console.error('Erro ao buscar espaço:', error)
    return new NextResponse(JSON.stringify({ 
      message: "Erro ao buscar espaço", 
      error: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    console.log("Session na rota PUT:", session)
    const user = session.user as UserWithRole
    const userRole = user.role
    let espacoId: string

    // Se o usuário é um espaço, usamos diretamente o ID do usuário
    if (userRole === "espaco" && user.id) {
      espacoId = user.id
    } 
    // Se o usuário é um admin, buscamos o espaço pelo adminId
    else if (userRole === "admin") {
      // Primeiro, encontramos o admin pelo email do usuário logado
      const admin = await prisma.admin.findUnique({
        where: {
          email: session.user.email
        }
      })

      if (!admin) {
        return new NextResponse("Admin não encontrado", { status: 404 })
      }

      // Encontramos o espaço associado a este admin
      const espacoExistente = await prisma.espaco.findFirst({
        where: {
          adminId: admin.id
        }
      })

      if (!espacoExistente) {
        return new NextResponse("Espaço não encontrado", { status: 404 })
      }

      espacoId = espacoExistente.id
    } else {
      return new NextResponse("Tipo de usuário não suportado", { status: 403 })
    }

    // Verificamos se o espaço existe
    const espacoExistente = await prisma.espaco.findUnique({
      where: {
        id: espacoId
      }
    })

    if (!espacoExistente) {
      return new NextResponse("Espaço não encontrado", { status: 404 })
    }

    // Filtra apenas os campos que existem no modelo Espaco do Prisma
    // Vamos criar o objeto com tipagem mais precisa para o Prisma
    const dadosAtualizados: Record<string, any> = {
      nome: body.nome,
      email: body.email,
      telefone: body.telefone || null,
      descricao: body.descricao,
      fotoPrincipal: body.fotoPrincipal || null,
      fotoCapa: body.fotoCapa || null,
      cep: body.cep,
      endereco: body.endereco,
      bairro: body.bairro,
      cidade: body.cidade,
      estado: body.estado,
      capacidade: body.capacidade || null,
      website: body.website || null,
      whatsapp: body.whatsapp || null,
      numero: body.numero || null,
      complemento: body.complemento || null,
    }

    // Log dos dados que serão enviados ao Prisma
    console.log('Dados a serem atualizados:', dadosAtualizados)

    // Remover campos undefined
    Object.keys(dadosAtualizados).forEach(key => {
      if (dadosAtualizados[key] === undefined) {
        delete dadosAtualizados[key];
      }
    });

    try {
      // Atualizar o espaço
      const espacoAtualizado = await prisma.espaco.update({
        where: {
          id: espacoId
        },
        data: dadosAtualizados
      })
      
      console.log('Espaço atualizado com sucesso:', espacoAtualizado)
      return NextResponse.json(espacoAtualizado)
    } catch (prismaError: unknown) {
      console.error('Erro do Prisma ao atualizar espaço:', prismaError)
      return new NextResponse(JSON.stringify({ 
        message: "Erro ao atualizar espaço", 
        error: prismaError instanceof Error ? prismaError.message : "Erro no Prisma Client"
      }), { status: 500 })
    }
  } catch (error: any) {
    console.error('Erro ao atualizar espaço:', error)
    return new NextResponse(JSON.stringify({ 
      message: "Erro ao atualizar espaço", 
      error: error.message || "Erro desconhecido" 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
