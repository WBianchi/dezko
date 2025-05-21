import { prisma } from '@/lib/prisma'
import * as argon2 from 'argon2'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Usamos o Prisma com tipagem aberta para a consulta - mostrando apenas um registro por espaço
    // com a assinatura mais recente (baseado na data de criação da assinatura)
    const espacos = await prisma.$queryRaw`
      WITH UltimaAssinatura AS (
        SELECT DISTINCT ON ("espacoId") *
        FROM "Assinatura"
        ORDER BY "espacoId", "createdAt" DESC
      )
      SELECT 
        e.id, 
        e.nome, 
        e.email, 
        e."createdAt",
        a.status as "statusAssinatura",
        a."dataInicio",
        a."dataExpiracao",
        p.nome as "planoNome"
      FROM "Espaco" e
      LEFT JOIN UltimaAssinatura a ON e.id = a."espacoId"
      LEFT JOIN "Plano" p ON a."planoId" = p.id
      ORDER BY e."createdAt" DESC
    `

    type EspacoResult = {
      id: string
      nome: string
      email: string
      createdAt: Date
      statusAssinatura?: string
      planoNome?: string
      dataInicio?: Date
      dataExpiracao?: Date
    }
    
    // Os dados já vêm formatados da consulta SQL
    const formattedEspacos = (espacos as EspacoResult[]).map(espaco => ({
      id: espaco.id,
      nome: espaco.nome,
      email: espaco.email,
      createdAt: espaco.createdAt,
      statusAssinatura: espaco.statusAssinatura || 'Nenhuma',
      planoNome: espaco.planoNome || 'Nenhum',
      dataInicio: espaco.dataInicio || null,
      dataExpiracao: espaco.dataExpiracao || null
    }))

    return NextResponse.json(formattedEspacos)
  } catch (error) {
    console.error('[ESPACOS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { nome, email, senha } = body

    // Hash da senha
    const hashedPassword = await argon2.hash(senha)

    // Buscar um admin para associar
    const admin = await prisma.admin.findFirst()
    
    if (!admin) {
      return new NextResponse('Admin não encontrado', { status: 404 })
    }
    
    const espaco = await prisma.espaco.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        status: "aprovado",
        admin: {
          connect: {
            id: admin.id
          }
        }
      },
    })

    return NextResponse.json(espaco)
  } catch (error) {
    console.error('[ESPACOS_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
