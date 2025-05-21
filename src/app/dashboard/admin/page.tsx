'use client'

import { Card } from '@/components/ui/card'
import { 
  Users, Building2, Calendar, CreditCard, 
  TrendingUp, ArrowUpRight, ArrowDownRight 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  ResponsiveHeader,
  ResponsiveStats,
  ResponsiveTable,
  ResponsiveFilters,
  ResponsiveCard
} from '@/components/dashboard/responsive-container'

async function getDashboardData() {
  const res = await fetch('/api/admin/dashboard')
  if (!res.ok) throw new Error('Falha ao carregar dados')
  return res.json()
}

export default function AdminDashboard() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: getDashboardData
  })

  if (error) return (
    <div className="p-4 text-red-600 bg-red-50 rounded-lg">
      Erro ao carregar dados do dashboard. Tente novamente mais tarde.
    </div>
  )

  const stats = [
    {
      title: 'Usuários',
      value: data?.stats.totalUsers.toLocaleString('pt-BR') ?? '...',
      change: `${data?.stats.userGrowth.toFixed(1)}%`,
      trend: data?.stats.userGrowth > 0 ? 'up' : 'down',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Espaços',
      value: data?.stats.totalSpaces.toLocaleString('pt-BR') ?? '...',
      change: '+8.2%',
      trend: 'up',
      icon: Building2,
      color: 'green',
    },
    {
      title: 'Reservas',
      value: data?.stats.totalBookings.toLocaleString('pt-BR') ?? '...',
      change: '+23.1%',
      trend: 'up',
      icon: Calendar,
      color: 'purple',
    },
    {
      title: 'Faturamento',
      value: data?.stats.totalRevenue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }) ?? '...',
      change: '-4.3%',
      trend: 'down',
      icon: CreditCard,
      color: 'yellow',
    },
  ]

  return (
    <ResponsiveContainer>
      <ResponsiveHeader 
        title="Dashboard Admin"
        subtitle="Bem-vindo de volta! Aqui está um resumo do sistema."
      />

      <ResponsiveStats>
        {stats.map((stat, index) => (
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
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>{stat.change}</span>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </ResponsiveStats>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Reservas Recentes</h3>
          <div className="space-y-4">
            {data?.recentBookings.map((booking: any) => (
              <div 
                key={booking.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{booking.usuario.nome}</h4>
                    <p className="text-sm text-gray-500">{booking.espaco.nome}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(booking.valor)}
                  </p>
                  <span className="text-sm text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Novos Espaços</h3>
          <div className="space-y-4">
            {data?.recentSpaces.map((space: any) => (
              <div
                key={space.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-green-100">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{space.nome}</h4>
                    <p className="text-sm text-gray-500">{space.endereco}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{space._count.pedidos} reservas</p>
                  <p className="text-sm text-gray-500">{space._count.avaliacoes} avaliações</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ResponsiveContainer>
  )
}
