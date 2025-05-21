'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const CORES = ['#0ea5e9', '#f43f5e', '#10b981', '#8b5cf6', '#f59e0b']

export default function RelatoriosPage() {
  const { data: relatorios } = useQuery({
    queryKey: ['relatorios'],
    queryFn: async () => {
      const response = await fetch('/api/admin/relatorios')
      const data = await response.json()
      return data
    },
  })

  const dadosVendas = relatorios?.vendasPorMes || []
  const dadosEspacos = relatorios?.espacosPorCategoria || []
  const dadosUsuarios = relatorios?.crescimentoUsuarios || []

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-sm text-muted-foreground">
            Visualize os dados e métricas do seu negócio
          </p>
        </div>
        <Separator />

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {relatorios?.totalVendas
                  ? `R$ ${relatorios.totalVendas.toFixed(2)}`
                  : 'Carregando...'}
              </div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Espaços Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {relatorios?.totalEspacos || 'Carregando...'}
              </div>
              <p className="text-xs text-muted-foreground">
                +12 espaços este mês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuários Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {relatorios?.totalUsuarios || 'Carregando...'}
              </div>
              <p className="text-xs text-muted-foreground">
                +180 usuários este mês
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Vendas por Mês</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosVendas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="mes"
                      tickFormatter={(value) =>
                        format(new Date(value), 'MMM', { locale: ptBR })
                      }
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `R$ ${value.toLocaleString('pt-BR')}`
                      }
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        `R$ ${value.toLocaleString('pt-BR')}`
                      }
                      labelFormatter={(label) =>
                        format(new Date(label), 'MMMM yyyy', { locale: ptBR })
                      }
                    />
                    <Bar dataKey="valor" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Distribuição de Espaços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosEspacos}
                      dataKey="quantidade"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) =>
                        `${entry.categoria}: ${entry.quantidade}`
                      }
                    >
                      {dadosEspacos?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CORES[index % CORES.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Crescimento de Usuários</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosUsuarios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="data"
                      tickFormatter={(value) =>
                        format(new Date(value), 'dd/MM', { locale: ptBR })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(label) =>
                        format(new Date(label), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="quantidade"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
