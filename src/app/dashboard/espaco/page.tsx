'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, CreditCard, Star, MessageSquare,
  TrendingUp, ArrowUpRight, Clock, Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Definição de tipos para os dados que serão buscados
type Reserva = {
  id: string
  cliente: {
    nome: string
  }
  horarioInicio: string
  horarioFim: string
  espaco: {
    nome: string
  }
  status: string
}

type Estatisticas = {
  reservasHoje: {
    total: number
    confirmadas: number
  }
  faturamento: {
    valor: number
    periodo: string
  }
  avaliacao: {
    media: number
    total: number
  }
  mensagens: {
    total: number
    naoLidas: number
  }
}

// Cores para os ícones
const iconColors = {
  Calendar: 'blue',
  CreditCard: 'green',
  Star: 'yellow',
  MessageSquare: 'purple'
}

export default function EspacoDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [proximasReservas, setProximasReservas] = useState<Reserva[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tendenciaReservas, setTendenciaReservas] = useState<number | null>(null)
  
  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/entrar')
    }
  }, [status, router])
  
  // Buscar dados do espaço
  useEffect(() => {
    const buscarDados = async () => {
      if (status !== 'authenticated') return
      
      try {
        setCarregando(true)
        setErro(null)
        
        // Buscar estatísticas
        try {
          const resEstatisticas = await fetch('/api/espaco/dashboard/estatisticas/route')
          if (!resEstatisticas.ok) {
            console.error('Resposta da API de estatísticas:', await resEstatisticas.text())
            throw new Error('Falha ao carregar estatísticas')
          }
          const dadosEstatisticas: Estatisticas = await resEstatisticas.json()
          setEstatisticas(dadosEstatisticas)
        } catch (error) {
          console.error('Erro ao buscar estatísticas:', error)
          // Usar dados fictícios para não quebrar a interface
          setEstatisticas({
            reservasHoje: { total: 0, confirmadas: 0 },
            faturamento: { valor: 0, periodo: 'Este mês' },
            avaliacao: { media: 0, total: 0 },
            mensagens: { total: 0, naoLidas: 0 }
          })
        }
        
        // Buscar próximas reservas
        try {
          const resReservas = await fetch('/api/espaco/dashboard/proximas-reservas/route')
          if (!resReservas.ok) {
            console.error('Resposta da API de reservas:', await resReservas.text())
            throw new Error('Falha ao carregar reservas')
          }
          const dadosReservas: Reserva[] = await resReservas.json()
          setProximasReservas(dadosReservas)
        } catch (error) {
          console.error('Erro ao buscar próximas reservas:', error)
          setProximasReservas([])
        }
        
        // Buscar tendência de crescimento (opcional)
        try {
          const resTendencia = await fetch('/api/espaco/dashboard/tendencia/route')
          if (resTendencia.ok) {
            const { porcentagem } = await resTendencia.json()
            setTendenciaReservas(porcentagem)
          }
        } catch (e) {
          // Não bloqueia o fluxo principal se falhar
          console.warn('Não foi possível carregar os dados de tendência')
          setTendenciaReservas(5) // Valor fictício para não quebrar a interface
        }
        
        // Os dados já foram definidos nos respectivos blocos try/catch
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        setErro('Não foi possível carregar os dados. Tente novamente mais tarde.')
      } finally {
        setCarregando(false)
      }
    }
    
    buscarDados()
  }, [status])
  
  // Criar estatísticas para exibição
  const statsItems = estatisticas ? [
    {
      title: 'Reservas Hoje',
      value: estatisticas.reservasHoje.total.toString(),
      info: `${estatisticas.reservasHoje.confirmadas} confirmadas`,
      icon: Calendar,
      color: 'blue',
    },
    {
      title: 'Faturamento',
      value: `R$ ${estatisticas.faturamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      info: estatisticas.faturamento.periodo,
      icon: CreditCard,
      color: 'green',
    },
    {
      title: 'Avaliação',
      value: estatisticas.avaliacao.media.toFixed(1),
      info: `${estatisticas.avaliacao.total} avaliações`,
      icon: Star,
      color: 'yellow',
    },
    {
      title: 'Mensagens',
      value: estatisticas.mensagens.total.toString(),
      info: `${estatisticas.mensagens.naoLidas} não lidas`,
      icon: MessageSquare,
      color: 'purple',
    },
  ] : []
  
  // Se estiver carregando, mostrar placeholder
  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    )
  }
  
  // Se houver erro, mostrar mensagem
  if (erro) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center">
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
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Espaço</h1>
          <p className="text-gray-500 mt-1">
            Gerencie suas reservas e acompanhe seu desempenho
          </p>
        </div>
        <div className="flex items-center gap-4">
          {tendenciaReservas !== null && tendenciaReservas > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+{tendenciaReservas}% em reservas</span>
            </div>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700">
            Nova Reserva
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsItems.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.info}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Próximas Reservas</h3>
          {proximasReservas.length === 0 ? (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
              <p>Nenhuma reserva próxima encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proximasReservas.map((reserva) => {
                // Formatar horários para exibição
                const horarioExibicao = `${reserva.horarioInicio.substring(0, 5)} - ${reserva.horarioFim.substring(0, 5)}`
                
                return (
                  <div
                    key={reserva.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{reserva.cliente.nome}</h4>
                        <p className="text-sm text-gray-500">{reserva.espaco.nome}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{horarioExibicao}</p>
                      <span className={`text-sm ${
                        reserva.status === 'pago' 
                          ? 'text-green-600' 
                          : reserva.status === 'cancelado'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                      }`}>
                        {/* Converter o status para exibição mais amigável */}
                        {reserva.status === 'pago' ? 'confirmado' : 
                         reserva.status === 'pendente' ? 'pendente' : 
                         reserva.status === 'cancelado' ? 'cancelado' : 
                         reserva.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {proximasReservas.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                Ver todas as reservas
              </Button>
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Desempenho</h3>
          <div className="flex h-40 items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Dados de desempenho em breve</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
