import { prisma } from '@/lib/prisma'
import * as argon2 from 'argon2'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { addDays } from 'date-fns'
import crypto from 'crypto'

export async function PATCH(
  req: Request,
  { params }: { params: { espacoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { nome, email, senha, planoId } = body

    if (!params.espacoId) {
      return new NextResponse('Espaço ID é necessário', { status: 400 })
    }

    const updateData: any = {
      nome,
      email,
    }

    if (senha) {
      updateData.senha = await argon2.hash(senha)
    }

    // Atualiza o espaço
    const espaco = await prisma.espaco.update({
      where: {
        id: params.espacoId,
      },
      data: updateData,
    })

    // Se um planoId foi fornecido, criar uma nova assinatura
    if (planoId) {
      try {
        // Buscar informações do plano
        const plano = await prisma.plano.findUnique({
          where: {
            id: planoId
          }
        })

        if (plano) {
          // Calcular a data de expiração com base na duração do plano (em dias)
          const dataInicio = new Date()
          const dataExpiracao = addDays(dataInicio, plano.duracao)

          // Verificar se já existe uma assinatura ativa - usando SQL Raw para evitar problemas com o tipo
          const assinaturasAtivas = await prisma.$queryRaw`
            SELECT id FROM "Assinatura" 
            WHERE "espacoId" = ${params.espacoId} AND status = 'ATIVA'
          `

          // Se existir uma assinatura ativa, cancelá-la
          if (assinaturasAtivas && Array.isArray(assinaturasAtivas) && assinaturasAtivas.length > 0) {
            const assinaturaId = (assinaturasAtivas[0] as any).id
            
            await prisma.$executeRaw`
              UPDATE "Assinatura" 
              SET status = 'CANCELADA' 
              WHERE id = ${assinaturaId}
            `
          }

          // Criar nova assinatura com SQL Raw
          await prisma.$executeRaw`
            INSERT INTO "Assinatura" ("id", "createdAt", "updatedAt", "status", "dataInicio", "dataExpiracao", "valor", "planoId", "espacoId")
            VALUES (
              ${crypto.randomUUID()},
              ${new Date()},
              ${new Date()},
              'ATIVA',
              ${dataInicio},
              ${dataExpiracao},
              ${plano.preco},
              ${plano.id},
              ${params.espacoId}
            )
          `
        }
      } catch (error) {
        console.error('[ASSINATURA_CREATE]', error)
      }
    }

    return NextResponse.json(espaco)
  } catch (error) {
    console.error('[ESPACO_PATCH]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { espacoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Obter o ID do espaço da URL - usando await para resolver o erro do Next.js
    const { espacoId } = await Promise.resolve(params)

    if (!espacoId) {
      return new NextResponse('Espaço ID é necessário', { status: 400 })
    }

    // Verificar se o espaço existe
    const espacoExiste = await prisma.espaco.findUnique({
      where: { id: espacoId }
    })

    if (!espacoExiste) {
      return new NextResponse('Espaço não encontrado', { status: 404 })
    }

    console.log(`[ESPACO_DELETE] Excluindo espaço ${espacoId} - ${espacoExiste.nome}`)

    // Usar abordagem mais simples - excluir entidades relacionadas uma a uma
    try {
      // 1. Primeiro, precisamos encontrar os planos relacionados ao espaço
      const planos = await prisma.plano.findMany({
        where: { espacoId },
        select: { id: true }
      })
      
      // 1.1 Excluir os benefícios dos planos encontrados usando SQL bruto para evitar problemas de nomenclatura
      if (planos.length > 0) {
        // Excluir os benefícios um a um para evitar problemas com o IN no SQL bruto
        for (const plano of planos) {
          await prisma.$executeRaw`DELETE FROM "BeneficioPlano" WHERE "planoId" = ${plano.id}`
        }
      }
      
      // 1.2 Agora podemos excluir os planos com segurança
      await prisma.plano.deleteMany({
        where: { espacoId }
      })

      // 2. Excluir associação com categorias usando execução SQL direta
      await prisma.$executeRaw`DELETE FROM "_EspacoCategoria" WHERE "A" = ${espacoId}`

      // 3. Excluir assinaturas se houver
      await prisma.$executeRaw`DELETE FROM "Assinatura" WHERE "espacoId" = ${espacoId}`

      // 4. Excluir reservas se houver
      await prisma.$executeRaw`DELETE FROM "Reservation" WHERE "espacoId" = ${espacoId}`

      // 5. Excluir agendas
      await prisma.agenda.deleteMany({
        where: { espacoId }
      })

      // 6. Excluir horários
      await prisma.horarios.deleteMany({
        where: { espacoId }
      })

      // 7. Excluir adicionais
      await prisma.adicionais.deleteMany({
        where: { espacoId }
      })

      // 8. Excluir vantagens
      await prisma.vantagens.deleteMany({
        where: { espacoId }
      })

      // 9. Excluir mensagens
      await prisma.mensagem.deleteMany({
        where: { espacoId }
      })

      // 10. Excluir avaliações
      await prisma.avaliacao.deleteMany({
        where: { espacoId }
      })

      // 11. Excluir configuração do espaço se existir
      if (await prisma.spaceConfig.findUnique({ where: { id: espacoId } })) {
        await prisma.spaceConfig.delete({ where: { id: espacoId } })
      }

      // 12. Excluir comissão do espaço se existir
      await prisma.spaceCommission.deleteMany({
        where: { spaceId: espacoId }
      })

      // 13. Finalmente excluir o espaço
      await prisma.espaco.delete({
        where: { id: espacoId }
      })

      console.log(`[ESPACO_DELETE] Espaço ${espacoId} excluído com sucesso`)
      return NextResponse.json({
        message: 'Espaço excluído com sucesso',
        id: espacoId,
      })
    } catch (error) {
      console.error('[ESPACO_DELETE] Erro ao excluir espaço:', error)
      return NextResponse.json(
        { error: 'Erro ao excluir o espaço. Verifique se não existem dados relacionados.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[ESPACO_DELETE]', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar a solicitação' },
      { status: 500 }
    )
  }
}
