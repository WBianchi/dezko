'use server'

import { prisma } from "@/lib/prisma"

export async function getEspaco(slug: string) {
  try {
    const nome = decodeURIComponent(slug).replace(/-/g, ' ')
    
    const espaco = await prisma.espaco.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        endereco: true,
        bairro: true,
        cidade: true,
        estado: true,
        cep: true,
        imagens: true,
        fotoCapa: true,
        fotoPrincipal: true,
        capacidade: true,
        status: true,
        horarios: {
          select: {
            diaSemana: true,
            horaInicio: true,
            horaFim: true
          }
        },
        categorias: {
          select: {
            id: true,
            nome: true
          }
        },
        agendas: {
          select: {
            id: true,
            titulo: true,
            tipoReserva: true,
            turno: true,
            horaInicio: true,
            horaFim: true,
            dataInicio: true,
            dataFim: true,
            valorHora: true,
            valorTurno: true,
            valorDia: true
          }
        },
        avaliacoes: {
          select: {
            nota: true,
            comentario: true,
            usuario: {
              select: {
                nome: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    if (!espaco) return null

    const avaliacaoMedia = espaco.avaliacoes.length > 0
      ? espaco.avaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / espaco.avaliacoes.length
      : 0

    // Pegando o primeiro horário disponível para exibição simplificada
    const horarioAbertura = espaco.horarios && espaco.horarios.length > 0 ? espaco.horarios[0].horaInicio : '08:00'
    const horarioFechamento = espaco.horarios && espaco.horarios.length > 0 ? espaco.horarios[0].horaFim : '18:00'
    
    return {
      ...espaco,
      galeria: espaco.imagens || [],
      avaliacao: Number(avaliacaoMedia.toFixed(1)),
      horarioAbertura,
      horarioFechamento
    }

  } catch (error) {
    console.error("[GET_ESPACO]", error)
    return null
  }
}
