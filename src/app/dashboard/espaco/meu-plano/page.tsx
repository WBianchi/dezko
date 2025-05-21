'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  CalendarDays,
  Clock,
  ArrowUpCircle,
  Users,
  CheckCircle,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react'

// Tipos para as informações do plano
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

export default function MeuPlanoPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [planoInfo, setPlanoInfo] = useState<PlanoInfo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  
  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/entrar')
    }
  }, [status, router])
  
  // Buscar informações do plano
  useEffect(() => {
    const buscarPlano = async () => {
      if (status !== 'authenticated') return
      
      try {
        setCarregando(true)
        setErro(null)
        
        console.log('Iniciando busca do plano...')
        
        const resposta = await fetch('/api/espaco/plano/info', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          },
          cache: 'no-store',
          next: { revalidate: 0 }
        })
        
        console.log('Status da resposta da API:', resposta.status)
        
        if (!resposta.ok) {
          if (resposta.status === 404) {
            console.error('Endpoint não encontrado (404)')
            // Usar plano simulado temporariamente para não bloquear o desenvolvimento
            setPlanoInfo({
              nome: 'Plano Básico',
              status: 'ativo',
              dataInicio: new Date().toISOString(),
              dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              agendasAdicionadas: 5,
              agendasDisponiveis: 7,
              limiteAgendas: 12,
              tipoPlano: 'básico',
              recursos: [
                { nome: 'Agendas ilimitadas', disponivel: false },
                { nome: 'Suporte prioritário', disponivel: false },
                { nome: 'Relatórios avançados', disponivel: false },
                { nome: 'API de integração', disponivel: false },
                { nome: 'Personalização avançada', disponivel: false },
              ],
              historicoRenovacoes: [
                { data: new Date().toISOString(), valor: 50, status: 'sucesso' }
              ]
            })
            setCarregando(false)
            return
          }
          throw new Error(`Falha ao carregar informações do plano: ${resposta.status}`)
        }
        
        const dados: PlanoInfo = await resposta.json()
        setPlanoInfo(dados)
      } catch (error) {
        console.error("Erro ao buscar informações do plano:", error)
        setErro('Não foi possível carregar as informações do seu plano. Tente novamente mais tarde.')
      } finally {
        setCarregando(false)
      }
    }
    
    buscarPlano()
  }, [status])
  
  // Formatar data para exibição
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  // Calcular dias restantes
  const calcularDiasRestantes = (dataExpiracao: string) => {
    const hoje = new Date()
    const dataExp = new Date(dataExpiracao)
    const diferenca = dataExp.getTime() - hoje.getTime()
    return Math.max(0, Math.floor(diferenca / (1000 * 60 * 60 * 24)))
  }
  
  // Tela de carregamento
  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Carregando informações do seu plano...</p>
        </div>
      </div>
    )
  }
  
  // Tela de erro
  if (erro) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{erro}</p>
        <Button 
          className="mt-4 bg-red-600 hover:bg-red-700" 
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </Button>
      </div>
    )
  }
  
  // Se não houver plano ativo, mostrar tela para contratação
  if (!planoInfo) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto">
          <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Você ainda não possui um plano ativo</h1>
          <p className="text-gray-600 mb-6">
            Escolha um dos nossos planos para desbloquear recursos exclusivos para o seu espaço.
          </p>
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/dashboard/espaco/planos')}
          >
            Ver planos disponíveis
          </Button>
        </div>
      </Card>
    )
  }
  
  const diasRestantes = calcularDiasRestantes(planoInfo.dataExpiracao)
  const percentualUtilizacaoAgendas = Math.min(100, Math.round((planoInfo.agendasAdicionadas / planoInfo.limiteAgendas) * 100))
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meu Plano</h1>
          <p className="text-gray-500 mt-1">
            Gerencie e visualize o seu plano atual
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push('/dashboard/espaco/planos')}
        >
          Alterar plano
        </Button>
      </div>
      
      {/* Card principal com informações do plano */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-7 w-7" />
                <h2 className="text-2xl font-bold">{planoInfo.nome}</h2>
                <Badge className={`
                  ${planoInfo.tipoPlano === 'básico' ? 'bg-blue-400' : 
                    planoInfo.tipoPlano === 'premium' ? 'bg-amber-500' : 'bg-purple-600'}
                `}>
                  {planoInfo.tipoPlano.toUpperCase()}
                </Badge>
              </div>
              <Badge variant={planoInfo.status === 'ativo' ? 'default' : 'destructive'} className="py-1">
                {planoInfo.status === 'ativo' ? 'ATIVO' : 
                 planoInfo.status === 'expirado' ? 'EXPIRADO' : 'PENDENTE'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <CalendarDays className="h-4 w-4" />
                  <span>Data de início</span>
                </div>
                <p className="text-lg font-semibold">{formatarData(planoInfo.dataInicio)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <CalendarDays className="h-4 w-4" />
                  <span>Data de expiração</span>
                </div>
                <p className="text-lg font-semibold">{formatarData(planoInfo.dataExpiracao)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  <span>Dias restantes</span>
                </div>
                <p className="text-lg font-semibold">{diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <Tabs defaultValue="recursos">
              <TabsList className="mb-6">
                <TabsTrigger value="recursos">Recursos do plano</TabsTrigger>
                <TabsTrigger value="agendas">Utilização de agendas</TabsTrigger>
                <TabsTrigger value="historico">Histórico de renovações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recursos" className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">Recursos inclusos no seu plano</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {planoInfo.recursos.map((recurso, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-3 p-3 rounded-lg 
                        ${recurso.disponivel ? 'bg-green-50' : 'bg-gray-50'}`}
                    >
                      {recurso.disponivel ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <span className={recurso.disponivel ? 'text-green-900' : 'text-gray-500'}>
                        {recurso.nome}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="agendas" className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">Utilização de agendas</h3>
                <Card className="p-6 border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Agendas utilizadas</span>
                    <span className="font-medium">
                      {planoInfo.agendasAdicionadas} de {planoInfo.limiteAgendas}
                    </span>
                  </div>
                  <Progress value={percentualUtilizacaoAgendas} className="h-2 mb-4" />
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Utilizadas: {planoInfo.agendasAdicionadas}</span>
                    <span>Disponíveis: {planoInfo.agendasDisponiveis}</span>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      variant="outline" 
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => router.push('/dashboard/espaco/agendas/nova')}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Adicionar nova agenda
                    </Button>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="historico" className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">Histórico de renovações</h3>
                <div className="overflow-hidden border rounded-lg">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {planoInfo.historicoRenovacoes.map((renovacao, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatarData(renovacao.data)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            R$ {renovacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${renovacao.status === 'sucesso' ? 'bg-green-100 text-green-800' : 
                                renovacao.status === 'falha' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {renovacao.status === 'sucesso' ? 'Sucesso' : 
                                renovacao.status === 'falha' ? 'Falha' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {planoInfo.historicoRenovacoes.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            Nenhuma renovação no histórico
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </motion.div>
      
      {/* Card de suporte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="rounded-full bg-blue-100 p-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold mb-1">Precisa de ajuda com seu plano?</h3>
              <p className="text-gray-600 mb-4">
                Nossa equipe de suporte está disponível para ajudar com qualquer dúvida sobre seu plano.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  Falar com suporte
                </Button>
                <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  FAQ
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
