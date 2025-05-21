import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Configuração para garantir que a rota seja dinâmica e não seja cacheada
export const dynamic = 'force-dynamic'
export const revalidate = 0

type RenovacaoAssinaturaType = {
  id: string
  createdAt: Date
  updatedAt: Date
  assinaturaId: string
  dataPagamento: Date
  valor: number
  status: string
  gateway: string
  gatewayId: string | null
}

type PlanoInfo = {
  nome: string
  status: 'ativo' | 'expirado' | 'pendente'
  dataInicio: string
  dataExpiracao: string
  agendasAdicionadas: number
  agendasDisponiveis: number
  limiteAgendas: number
  tipoPlano: 'básico' | 'premium' | 'enterprise'
  recursos: Array<{
    nome: string
    disponivel: boolean
  }>
  historicoRenovacoes: Array<{
    data: string
    valor: number
    status: 'sucesso' | 'falha' | 'pendente'
  }>
}

// Dados simulados de plano para demonstração
const gerarPlanoSimulado = (agendasAdicionadas: number = 0): PlanoInfo => {
  const tipoPlano: 'básico' | 'premium' | 'enterprise' = 'premium'
  const dataAtual = new Date()
  const dataInicio = new Date(dataAtual)
  dataInicio.setMonth(dataInicio.getMonth() - 1)
  const dataExpiracao = new Date(dataAtual)
  dataExpiracao.setMonth(dataExpiracao.getMonth() + 1)
  
  const limiteAgendasPorPlano = {
    'básico': 2,
    'premium': 5,
    'enterprise': 10
  }
  
  const limiteAgendas = limiteAgendasPorPlano[tipoPlano]
  const agendasDisponiveis = Math.max(0, limiteAgendas - agendasAdicionadas)
  
  // Lista de recursos por tipo de plano
  const recursosPorPlano = {
    'básico': [
      { nome: 'Agendamento online', disponivel: true },
      { nome: 'Painel administrativo', disponivel: true },
      { nome: 'Até 2 agendas', disponivel: true },
      { nome: 'Relatórios básicos', disponivel: true },
      { nome: 'Gestão de reservas', disponivel: true },
      { nome: 'Múltiplos métodos de pagamento', disponivel: false },
      { nome: 'API de integração', disponivel: false },
      { nome: 'Suporte prioritário', disponivel: false }
    ],
    'premium': [
      { nome: 'Agendamento online', disponivel: true },
      { nome: 'Painel administrativo', disponivel: true },
      { nome: 'Até 5 agendas', disponivel: true },
      { nome: 'Relatórios avançados', disponivel: true },
      { nome: 'Gestão de reservas', disponivel: true },
      { nome: 'Múltiplos métodos de pagamento', disponivel: true },
      { nome: 'API de integração', disponivel: false },
      { nome: 'Suporte prioritário', disponivel: true }
    ],
    'enterprise': [
      { nome: 'Agendamento online', disponivel: true },
      { nome: 'Painel administrativo', disponivel: true },
      { nome: 'Até 10 agendas', disponivel: true },
      { nome: 'Relatórios avançados', disponivel: true },
      { nome: 'Gestão de reservas', disponivel: true },
      { nome: 'Múltiplos métodos de pagamento', disponivel: true },
      { nome: 'API de integração', disponivel: true },
      { nome: 'Suporte prioritário', disponivel: true }
    ]
  }
  
  // Gerar uma data para renovação no passado
  const dataRenovacao = new Date(dataInicio)
  
  return {
    nome: `Plano ${tipoPlano.charAt(0).toUpperCase() + tipoPlano.slice(1)}`,
    status: 'ativo',
    dataInicio: dataInicio.toISOString(),
    dataExpiracao: dataExpiracao.toISOString(),
    agendasAdicionadas,
    agendasDisponiveis,
    limiteAgendas,
    tipoPlano,
    recursos: recursosPorPlano[tipoPlano],
    historicoRenovacoes: [
      {
        data: dataRenovacao.toISOString(),
        valor: 99.90,
        status: 'sucesso'
      }
    ]
  }
}

// Função auxiliar para obter recursos por tipo de plano
function obterRecursosPorTipoPlano(tipoPlano: string) {
  const recursosPorPlano: Record<string, Array<{nome: string, disponivel: boolean}>> = {
    'basico': [
      { nome: 'Agendamento online', disponivel: true },
      { nome: 'Painel administrativo', disponivel: true },
      { nome: 'Até 2 agendas', disponivel: true },
      { nome: 'Relatórios básicos', disponivel: true },
      { nome: 'Gestão de reservas', disponivel: true },
      { nome: 'Múltiplos métodos de pagamento', disponivel: false },
      { nome: 'API de integração', disponivel: false },
      { nome: 'Suporte prioritário', disponivel: false }
    ],
    'premium': [
      { nome: 'Agendamento online', disponivel: true },
      { nome: 'Painel administrativo', disponivel: true },
      { nome: 'Até 5 agendas', disponivel: true },
      { nome: 'Relatórios avançados', disponivel: true },
      { nome: 'Gestão de reservas', disponivel: true },
      { nome: 'Múltiplos métodos de pagamento', disponivel: true },
      { nome: 'API de integração', disponivel: false },
      { nome: 'Suporte prioritário', disponivel: true }
    ],
    'enterprise': [
      { nome: 'Agendamento online', disponivel: true },
      { nome: 'Painel administrativo', disponivel: true },
      { nome: 'Até 10 agendas', disponivel: true },
      { nome: 'Relatórios avançados', disponivel: true },
      { nome: 'Gestão de reservas', disponivel: true },
      { nome: 'Múltiplos métodos de pagamento', disponivel: true },
      { nome: 'API de integração', disponivel: true },
      { nome: 'Suporte prioritário', disponivel: true }
    ]
  }
  
  return recursosPorPlano[tipoPlano] || recursosPorPlano['basico']
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }
    
    // Buscar usuário logado
    const email = session.user?.email as string
    
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
    
    // Buscar espaço do usuário
    const espaco = await prisma.espaco.findFirst({
      where: {
        usuarios: {
          some: {
            id: usuario.id
          }
        }
      },
      include: {
        agendas: true
      }
    })
    
    if (!espaco) {
      return NextResponse.json(
        { message: "Espaço não encontrado" },
        { status: 404 }
      )
    }
    
    try {
      // Tentar buscar a assinatura mais recente e ativa do espaço com SQL raw
      const assinaturasRaw = await prisma.$queryRaw`
        SELECT
          a.id,
          a.status,
          a."dataInicio",
          a."dataExpiracao",
          a.valor,
          p.id as "planoId",
          p.nome as "planoNome",
          p."limiteAgendas",
          p.tipo as "planoTipo"
        FROM "Assinatura" a
        LEFT JOIN "Plano" p ON a."planoId" = p.id
        WHERE a."espacoId" = ${espaco.id}
        AND a.status = 'ATIVA'
        ORDER BY a."dataInicio" DESC
        LIMIT 1
      `
      
      const assinaturas = assinaturasRaw as any[]
      
      // Verificar se existem assinaturas ativas
      if (!assinaturas || assinaturas.length === 0) {
        console.log("[ESPACO_PLANO_INFO] Nenhuma assinatura ativa encontrada para o espaço ID:", espaco.id)
        
        // Buscar assinaturas inativas/expiradas para mostrar a última usando SQL raw
        const assinaturasInativasRaw = await prisma.$queryRaw`
          SELECT
            a.id,
            a.status,
            a."dataInicio",
            a."dataExpiracao",
            a.valor,
            p.id as "planoId",
            p.nome as "planoNome",
            p."limiteAgendas",
            p.tipo as "planoTipo"
          FROM "Assinatura" a
          LEFT JOIN "Plano" p ON a."planoId" = p.id
          WHERE a."espacoId" = ${espaco.id}
          ORDER BY a."dataInicio" DESC
          LIMIT 1
        `
        
        const assinaturasInativas = assinaturasInativasRaw as any[]
        
        if (assinaturasInativas && assinaturasInativas.length > 0) {
          // Existe uma assinatura inativa/expirada
          const assinaturaExpirada = assinaturasInativas[0] as any
          const agendasAdicionadas = espaco.agendas ? espaco.agendas.length : 0
          const limiteAgendas = assinaturaExpirada.limiteAgendas || 2
          const tipoPlano = assinaturaExpirada.planoTipo || 'basico'
          const dataInicio = new Date(assinaturaExpirada.dataInicio)
          const dataExpiracao = new Date(assinaturaExpirada.dataExpiracao)
          
          return NextResponse.json({
            nome: assinaturaExpirada.planoNome || "Plano Expirado",
            status: 'expirado',
            dataInicio: dataInicio.toISOString(),
            dataExpiracao: dataExpiracao.toISOString(),
            agendasAdicionadas,
            agendasDisponiveis: 0,
            limiteAgendas,
            tipoPlano: tipoPlano as 'básico' | 'premium' | 'enterprise',
            valor: assinaturaExpirada.valor,
            recursos: obterRecursosPorTipoPlano(tipoPlano),
            historicoRenovacoes: []
          })
        }
        
        // Se não houver nenhuma assinatura, retornar info de "sem plano"
        const agendasAdicionadas = espaco.agendas ? espaco.agendas.length : 0
        return NextResponse.json({
          nome: "Sem plano ativo",
          status: 'pendente',
          dataInicio: new Date().toISOString(),
          dataExpiracao: new Date().toISOString(),
          agendasAdicionadas,
          agendasDisponiveis: 0,
          limiteAgendas: 0,
          tipoPlano: 'básico',
          recursos: [],
          historicoRenovacoes: []
        })
      }
      
      const assinatura = assinaturas[0] as any
      const dataAtual = new Date()
      const dataExpiracao = new Date(assinatura.dataExpiracao)
      
      // Calcular status da assinatura
      let status: 'ativo' | 'expirado' | 'pendente' = 'pendente'
      
      if (
        assinatura.status === 'ATIVA' && 
        dataExpiracao > dataAtual
      ) {
        status = 'ativo'
      } else if (dataExpiracao <= dataAtual) {
        status = 'expirado'
      }
      
      try {
        // Buscar histórico de renovações usando SQL raw
        const renovacoesRaw = await prisma.$queryRaw`
          SELECT
            id,
            "dataPagamento",
            valor,
            status,
            gateway,
            "gatewayId"
          FROM "RenovacaoAssinatura"
          WHERE "assinaturaId" = ${assinatura.id}
          ORDER BY "dataPagamento" DESC
        `
        
        const renovacoes = renovacoesRaw as RenovacaoAssinaturaType[]
        
        // Converter status das renovações
        const historicoRenovacoes = renovacoes.map((renovacao: RenovacaoAssinaturaType) => {
          const dataPagamento = new Date(renovacao.dataPagamento);
          return {
            data: dataPagamento.toISOString(),
            valor: renovacao.valor,
            status: renovacao.status.toLowerCase() === 'pago' ? 'sucesso' : 
                  renovacao.status.toLowerCase() === 'cancelado' ? 'falha' : 'pendente'
          }
        })
        
        // Determinar o tipo de plano com base no valor
        let tipoPlano: 'básico' | 'premium' | 'enterprise' = 'básico'
        if (assinatura.valor >= 300) {
          tipoPlano = 'enterprise'
        } else if (assinatura.valor >= 100) {
          tipoPlano = 'premium'
        }
        
        // Determinar limite de agendas com base no tipo de plano
        const limiteAgendasPorPlano = {
          'básico': 2,
          'premium': 5,
          'enterprise': 10
        }
        
        const limiteAgendas = limiteAgendasPorPlano[tipoPlano]
        const agendasAdicionadas = espaco.agendas ? espaco.agendas.length : 0
        const agendasDisponiveis = Math.max(0, limiteAgendas - agendasAdicionadas)
        
        // Lista de recursos por tipo de plano
        const recursosPorPlano = {
          'básico': [
            { nome: 'Agendamento online', disponivel: true },
            { nome: 'Painel administrativo', disponivel: true },
            { nome: 'Até 2 agendas', disponivel: true },
            { nome: 'Relatórios básicos', disponivel: true },
            { nome: 'Gestão de reservas', disponivel: true },
            { nome: 'Múltiplos métodos de pagamento', disponivel: false },
            { nome: 'API de integração', disponivel: false },
            { nome: 'Suporte prioritário', disponivel: false }
          ],
          'premium': [
            { nome: 'Agendamento online', disponivel: true },
            { nome: 'Painel administrativo', disponivel: true },
            { nome: 'Até 5 agendas', disponivel: true },
            { nome: 'Relatórios avançados', disponivel: true },
            { nome: 'Gestão de reservas', disponivel: true },
            { nome: 'Múltiplos métodos de pagamento', disponivel: true },
            { nome: 'API de integração', disponivel: false },
            { nome: 'Suporte prioritário', disponivel: true }
          ],
          'enterprise': [
            { nome: 'Agendamento online', disponivel: true },
            { nome: 'Painel administrativo', disponivel: true },
            { nome: 'Até 10 agendas', disponivel: true },
            { nome: 'Relatórios avançados', disponivel: true },
            { nome: 'Gestão de reservas', disponivel: true },
            { nome: 'Múltiplos métodos de pagamento', disponivel: true },
            { nome: 'API de integração', disponivel: true },
            { nome: 'Suporte prioritário', disponivel: true }
          ]
        }
        
        // Construir resposta com todas as informações do plano
        const planoTipoFromDB = assinatura.planoTipo || tipoPlano
        const planoTipoFormatado = planoTipoFromDB === 'basico' ? 'básico' : 
                                  planoTipoFromDB === 'premium' ? 'premium' : 'enterprise'
        
        const dataInicio = new Date(assinatura.dataInicio)
        const dataExpiracao = new Date(assinatura.dataExpiracao)
        
        const planoInfo = {
          nome: assinatura.planoNome || `Plano ${planoTipoFormatado.charAt(0).toUpperCase() + planoTipoFormatado.slice(1)}`,
          status,
          dataInicio: dataInicio.toISOString(),
          dataExpiracao: dataExpiracao.toISOString(),
          agendasAdicionadas,
          agendasDisponiveis,
          limiteAgendas: assinatura.limiteAgendas || limiteAgendas,
          tipoPlano: planoTipoFormatado as 'básico' | 'premium' | 'enterprise',
          valor: assinatura.valor,
          recursos: recursosPorPlano[planoTipoFormatado] || recursosPorPlano['básico'],
          historicoRenovacoes
        }
        
        return NextResponse.json(planoInfo)
      } catch (renovacaoError) {
        console.error("[ESPACO_PLANO_INFO] Erro ao buscar renovações:", renovacaoError)
        // Se houver erro ao buscar renovações, retornar plano simulado
        const agendasAdicionadas = espaco.agendas ? espaco.agendas.length : 0
        return NextResponse.json(gerarPlanoSimulado(agendasAdicionadas))
      }
    } catch (assinaturaError) {
      console.error("[ESPACO_PLANO_INFO] Erro ao buscar assinaturas:", assinaturaError)
      // Se houver erro ao buscar assinaturas, retornar plano simulado
      const agendasAdicionadas = espaco.agendas ? espaco.agendas.length : 0
      return NextResponse.json(gerarPlanoSimulado(agendasAdicionadas))
    }
  } catch (error) {
    console.error("[ESPACO_PLANO_INFO] Erro geral:", error)
    // Em caso de erro geral, retornar plano simulado básico
    return NextResponse.json(gerarPlanoSimulado())
  }
}
