'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, CreditCard, Search, Star, 
  Building2, Users, Inbox, CheckCircle, TrendingUp,
  Home, Zap, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// Variante de animação para elementos
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

// Estatísticas do usuário
const userStats = [
  { id: 1, title: 'Reservas', icon: Calendar, value: 0, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  { id: 2, title: 'Pagamentos', icon: CreditCard, value: 0, color: 'text-green-500', bgColor: 'bg-green-100' },
  { id: 3, title: 'Mensagens', icon: Inbox, value: 0, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  { id: 4, title: 'Avaliações', icon: Star, value: 0, color: 'text-amber-500', bgColor: 'bg-amber-100' }
]

// Categorias populares
const popularCategories = [
  { id: 1, name: 'Coworking', icon: Users, count: 120, color: 'bg-blue-500' },
  { id: 2, name: 'Salas de Reunião', icon: Home, count: 85, color: 'bg-purple-500' },
  { id: 3, name: 'Estúdios', icon: Zap, count: 64, color: 'bg-pink-500' },
  { id: 4, name: 'Escritórios', icon: Building2, count: 47, color: 'bg-amber-500' }
]

export default function UsuarioDashboard() {
  const { data: session } = useSession()
  const userName = session?.user?.name?.split(' ')[0] || 'Usuário'
  
  // Buscar dados das reservas do usuário
  const { data: reservasData, isLoading: loadingReservas } = useQuery({
    queryKey: ['reservas-usuario-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/usuario/reservas')
      return response.json()
    },
    enabled: !!session?.user
  })
  
  // Buscar dados de pagamentos do usuário
  const { data: pagamentosData, isLoading: loadingPagamentos } = useQuery({
    queryKey: ['pagamentos-usuario-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/usuario/pagamentos')
      return response.json()
    },
    enabled: !!session?.user
  })
  
  // Buscar espaços recomendados
  const { data: espacosData, isLoading: loadingEspacos } = useQuery({
    queryKey: ['espacos-recomendados'],
    queryFn: async () => {
      const response = await fetch('/api/espacos/recomendados?limit=2')
      return response.json().catch(() => ({ espacos: [] }))
    }
  })
  
  // Preparar estatísticas do usuário
  const statsData = [...userStats]
  if (reservasData?.estatisticas) {
    statsData[0].value = reservasData.estatisticas.totalReservas || 0
  }
  if (pagamentosData?.estatisticas) {
    statsData[1].value = pagamentosData.estatisticas.pagamentosConcluidos || 0
  }
  
  // Formatar próximas reservas
  const proximasReservas = reservasData?.reservas?.slice(0, 3).map((reserva: any) => ({
    id: reserva.id,
    space: reserva.espaco?.nome || 'Espaço não disponível',
    room: reserva.espaco?.tipoEspaco || 'Sala',
    date: format(new Date(reserva.dataInicio), 'dd MMM, yyyy', { locale: ptBR }),
    time: `${format(new Date(reserva.dataInicio), 'HH:mm')} - ${format(new Date(reserva.dataFim), 'HH:mm')}`,
    status: reserva.status.toLowerCase()
  })) || []
  
  // Formatar espaços recomendados
  const espacosRecomendados = espacosData?.espacos || []

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {userName}!</h1>
          <p className="text-muted-foreground mt-1">
            Seu painel para descobrir e gerenciar espaços de trabalho
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Encontrar espaços</span>
          </Button>
        </div>
      </motion.div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <motion.div 
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <div className="p-6 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  {loadingReservas || loadingPagamentos ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className="text-3xl font-bold">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Abas para diferentes seções do dashboard */}
      <Tabs defaultValue="reservas" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="reservas">Próximas Reservas</TabsTrigger>
          <TabsTrigger value="recomendados">Espaços Recomendados</TabsTrigger>
          <TabsTrigger value="categorias">Categorias Populares</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reservas" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Próximas Reservas</h3>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                Ver todas
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {loadingReservas ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : proximasReservas.length > 0 ? (
              <div className="space-y-4">
                {proximasReservas.map((booking: any) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{booking.space}</h4>
                        <p className="text-sm text-muted-foreground">{booking.room}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{booking.date}</span>
                          <Clock className="h-3.5 w-3.5 ml-2" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={booking.status === 'confirmado' || booking.status === 'approved' ? 
                      'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-400' :
                      'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-400'
                    }>
                      {booking.status === 'confirmado' || booking.status === 'approved' ? 'Confirmado' : 'Pendente'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhuma reserva</h3>
                <p className="text-muted-foreground mt-1">Você não tem reservas agendadas</p>
                <Button className="mt-4">
                  Fazer uma reserva
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="recomendados" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Espaços Recomendados</h3>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                Ver mais
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {loadingEspacos ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-24 w-24 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : espacosRecomendados.length > 0 ? (
              <div className="space-y-4">
                {espacosRecomendados.map((espaco: any) => (
                  <motion.div
                    key={espaco.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="w-24 h-24 rounded-lg bg-muted relative overflow-hidden">
                      {espaco.imagens && espaco.imagens[0] ? (
                        <img 
                          src={espaco.imagens[0]} 
                          alt={espaco.nome} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Building2 className="h-12 w-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{espaco.nome}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{espaco.endereco || 'Endereço não disponível'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-medium">{espaco.avaliacao || '4.5'}</span>
                        </div>
                        <span className="font-medium text-primary">
                          {espaco.valor ? `R$ ${espaco.valor}/hora` : 'Sob consulta'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhum espaço encontrado</h3>
                <p className="text-muted-foreground mt-1">Ainda estamos trabalhando em recomendações para você</p>
                <Button className="mt-4">
                  Explorar espaços
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="categorias" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Categorias Populares</h3>
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color}`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{category.count} espaços disponíveis</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
