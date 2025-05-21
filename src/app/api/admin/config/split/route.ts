import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type PlanCommissionType = {
  id: string
  planId: string
  commissionType: string
  commissionValue: number
  createdAt: Date
  updatedAt: Date
  plan: {
    id: string
    nome: string
    preco: number
  }
}

type SpaceCommissionType = {
  id: string
  spaceId: string
  commissionType: string
  commissionValue: number
  createdAt: Date
  updatedAt: Date
  espaco: {
    id: string
    nome: string
  }
}

type ConfigSplitType = {
  id: string
  type: string
  commissionType: string
  commissionValue: number
  enablePlanCommission: boolean
  openPixEnabled: boolean
  openPixWalletId: string | null
  stripeEnabled: boolean
  stripeAccountId: string | null
  stripeCommissionRate: number
  createdAt: Date
  updatedAt: Date
}

// GET - Buscar configuração atual de split
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verificar se o schema já foi migrado
    let globalConfig = null
    let planCommissions: PlanCommissionType[] = []
    let spaceCommissions: SpaceCommissionType[] = []

    try {
      // Buscar configuração global
      const configResult = await prisma.$queryRaw<ConfigSplitType[]>`
        SELECT * FROM "ConfigSplit" WHERE type = 'global' LIMIT 1
      `
      globalConfig = configResult?.[0] || null

      // Buscar configurações específicas de comissão por plano
      planCommissions = await prisma.$queryRaw<PlanCommissionType[]>`
        SELECT pc.*, p.id as "plan_id", p.nome, p.preco 
        FROM "PlanCommission" pc
        JOIN "Plano" p ON pc."planId" = p.id
      `

      // Buscar configurações específicas de comissão por espaço
      spaceCommissions = await prisma.$queryRaw<SpaceCommissionType[]>`
        SELECT sc.*, e.id as "espaco_id", e.nome 
        FROM "SpaceCommission" sc
        JOIN "Espaco" e ON sc."spaceId" = e.id
      `
    } catch (error) {
      console.error("Tabelas ainda não existem:", error)
      // As tabelas ainda não existem, usar valores default
    }

    // Transformar dados para o formato esperado pelo frontend
    const configData = {
      globalCommission: {
        defaultType: globalConfig ? globalConfig.commissionType : 'percentage',
        defaultValue: globalConfig ? globalConfig.commissionValue : 10,
        enablePlanCommission: globalConfig ? globalConfig.enablePlanCommission : false,
        defaultOpenPixWalletId: globalConfig ? globalConfig.openPixWalletId || '' : ''
      },
      openPix: {
        enabled: globalConfig ? globalConfig.openPixEnabled : true,
        walletId: globalConfig ? globalConfig.openPixWalletId || '' : ''
      },
      stripe: {
        enabled: globalConfig ? globalConfig.stripeEnabled : true,
        accountId: globalConfig ? globalConfig.stripeAccountId || '' : '',
        commissionRate: globalConfig ? globalConfig.stripeCommissionRate : 10
      },
      planCommissions: planCommissions.map((commission: PlanCommissionType) => ({
        planId: commission.planId,
        commissionType: commission.commissionType,
        commissionValue: commission.commissionValue
      })),
      spaceCommissions: spaceCommissions.map((commission: SpaceCommissionType) => ({
        spaceId: commission.spaceId,
        commissionType: commission.commissionType,
        commissionValue: commission.commissionValue,
        customSplit: true
      }))
    }

    return NextResponse.json(configData)
  } catch (error) {
    console.error('[CONFIG_SPLIT_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// POST - Salvar configuração de split
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { globalCommission, openPix, stripe, planCommissions, spaceCommissions } = body

    try {
      // Verificar se a tabela ConfigSplit existe primeiro
      const hasConfigSplitTable = await prisma.$queryRaw<{ exists: boolean }[]>`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ConfigSplit'
        ) as exists
      `

      if (!hasConfigSplitTable[0].exists) {
        // Tabela ainda não existe, aguardar migração
        return NextResponse.json({ success: false, message: 'Banco de dados não está atualizado, execute prisma migrate deploy primeiro' }, { status: 500 })
      }
      
      // Garantir que dados opcionais são tratados corretamente
      const openPixWalletId = openPix.walletId || globalCommission.defaultOpenPixWalletId || null;
      const stripeAccountId = stripe.accountId || null;

      // Salvar configuração global (upsert com queryRaw para garantir compatibilidade)
      const existingConfig = await prisma.$queryRaw<any[]>`
        SELECT * FROM "ConfigSplit" WHERE type = 'global' LIMIT 1
      `

      if (existingConfig.length > 0) {
        // Atualizar configuração existente
        await prisma.$executeRaw`
          UPDATE "ConfigSplit" SET 
            "commissionType" = ${globalCommission.defaultType},
            "commissionValue" = ${globalCommission.defaultValue},
            "enablePlanCommission" = ${globalCommission.enablePlanCommission},
            "openPixEnabled" = ${openPix.enabled},
            "openPixWalletId" = ${openPixWalletId},
            "stripeEnabled" = ${stripe.enabled},
            "stripeAccountId" = ${stripeAccountId},
            "stripeCommissionRate" = ${stripe.commissionRate},
            "updatedAt" = NOW()
          WHERE type = 'global'
        `
      } else {
        // Criar nova configuração
        await prisma.$executeRaw`
          INSERT INTO "ConfigSplit" (
            id, type, "commissionType", "commissionValue", "enablePlanCommission", 
            "openPixEnabled", "openPixWalletId", "stripeEnabled", "stripeAccountId", 
            "stripeCommissionRate", "createdAt", "updatedAt"
          ) VALUES (
            ${crypto.randomUUID()}, 'global', ${globalCommission.defaultType}, ${globalCommission.defaultValue}, 
            ${globalCommission.enablePlanCommission}, ${openPix.enabled}, ${openPixWalletId}, 
            ${stripe.enabled}, ${stripeAccountId}, ${stripe.commissionRate}, NOW(), NOW()
          )
        `
      }

      // Processar comissões por plano
      if (planCommissions && planCommissions.length > 0) {
        // Deletar comissões existentes
        await prisma.$executeRaw`DELETE FROM "PlanCommission"`
        
        // Criar novas comissões
        for (const commission of planCommissions) {
          await prisma.$executeRaw`
            INSERT INTO "PlanCommission" (
              id, "planId", "commissionType", "commissionValue", "createdAt", "updatedAt"
            ) VALUES (
              ${crypto.randomUUID()}, ${commission.planId}, ${commission.commissionType}, 
              ${commission.commissionValue}, NOW(), NOW()
            )
          `
        }
      }

      // Processar comissões por espaço
      if (spaceCommissions && spaceCommissions.length > 0) {
        // Filtrar apenas os espaços com customSplit = true
        const customCommissions = spaceCommissions.filter((comm: { customSplit?: boolean; spaceId: string; commissionType: string; commissionValue: number }) => comm.customSplit)
        
        // Deletar comissões existentes
        await prisma.$executeRaw`DELETE FROM "SpaceCommission"`
        
        // Criar novas comissões
        for (const commission of customCommissions) {
          await prisma.$executeRaw`
            INSERT INTO "SpaceCommission" (
              id, "spaceId", "commissionType", "commissionValue", "createdAt", "updatedAt"
            ) VALUES (
              ${crypto.randomUUID()}, ${commission.spaceId}, ${commission.commissionType}, 
              ${commission.commissionValue}, NOW(), NOW()
            )
          `
        }
      }

      return NextResponse.json({ success: true, message: 'Configuração salva com sucesso' })
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      return NextResponse.json({ 
        success: false, 
        message: 'Erro ao salvar configurações. O banco de dados pode não estar atualizado.', 
        error: String(error) 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('[CONFIG_SPLIT_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
