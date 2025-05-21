import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }
    
    // Buscar espaço associado ao usuário logado
    const email = session.user?.email as string
    
    // Primeiro encontramos o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { 
        email: email
      }
    })
    
    if (!usuario) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }
    
    // Depois buscamos o espaço relacionado ao usuário
    const espaco = await prisma.espaco.findFirst({
      where: {
        usuarios: {
          some: {
            id: usuario.id
          }
        }
      }
    })
    
    if (!espaco) {
      return NextResponse.json(
        { message: "Usuário não possui espaço associado" },
        { status: 404 }
      )
    }
    
    const espacoId = espaco.id
    
    // Data atual
    const agora = new Date()
    
    // Buscar próximas reservas
    const reservas = await prisma.reservation.findMany({
      where: {
        espacoId: espacoId,
        dataInicio: {
          gte: agora
        }
      },
      orderBy: {
        dataInicio: 'asc'
      },
      take: 5, // Limitar a 5 próximas reservas
      include: {
        usuario: {
          select: {
            nome: true
          }
        },
        agenda: {
          select: {
            horaInicio: true,
            horaFim: true
          }
        },
        espaco: {
          select: {
            nome: true
          }
        }
      }
    })
    
    // Formatar os dados para o frontend
    const reservasFormatadas = reservas.map(reserva => ({
      id: reserva.id,
      cliente: {
        nome: reserva.usuario.nome
      },
      horarioInicio: reserva.agenda.horaInicio || "",
      horarioFim: reserva.agenda.horaFim || "",
      espaco: {
        nome: reserva.espaco.nome
      },
      status: reserva.status.toLowerCase() // Converter para minúsculas para interface
    }))
    
    return NextResponse.json(reservasFormatadas)
  } catch (error) {
    console.error("[ESPACO_DASHBOARD_PROXIMAS_RESERVAS]", error)
    return NextResponse.json(
      { message: "Erro ao buscar próximas reservas" },
      { status: 500 }
    )
  }
}
