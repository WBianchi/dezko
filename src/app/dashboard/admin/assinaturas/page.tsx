'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Download,
  Receipt,
  User,
  Package,
  Clock,
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Ban
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Interface para as assinaturas
interface Assinatura {
  id: string
  espacoId: string
  espaco: {
    id: string
    nome: string
    email: string
    fotoPrincipal?: string | null
  }
  planoId: string | null
  plano: {
    id: string
    nome: string
  } | null
  status: string
  dataInicio: Date
  dataExpiracao: Date
  valor: number
  formaPagamento: string | null
  stripeSubscriptionId?: string | null
  stripeCustomerId?: string | null
  stripePriceId?: string | null
}

export default function AssinaturasAdmin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalAtivas, setTotalAtivas] = useState(0)
  const [totalCanceladas, setTotalCanceladas] = useState(0)
  
  // Verificar sessão
  useEffect(() => {
    if (session && session.user && session.user.role !== 'admin') {
      toast.error('Você não tem permissão para acessar esta página')
      router.push('/dashboard')
    }
  }, [session, router])
  
  // Buscar assinaturas
  useEffect(() => {
    const fetchAssinaturas = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/assinaturas')
        
        if (!response.ok) {
          throw new Error('Erro ao buscar assinaturas')
        }
        
        const data = await response.json()
        
        // Formatar datas e campos
        const assinaturasFormatadas = data.map((item: any) => ({
          ...item,
          dataInicio: new Date(item.dataInicio),
          dataExpiracao: new Date(item.dataExpiracao),
        }))
        
        setAssinaturas(assinaturasFormatadas)
        
        // Contar totais por status
        setTotalAtivas(assinaturasFormatadas.filter((a: Assinatura) => a.status === 'ATIVA').length)
        setTotalCanceladas(assinaturasFormatadas.filter((a: Assinatura) => a.status === 'CANCELADA').length)
      } catch (error) {
        console.error('Erro ao buscar assinaturas:', error)
        toast.error('Não foi possível carregar as assinaturas')
      } finally {
        setLoading(false)
      }
    }
    
    if (session?.user?.role === 'admin') {
      fetchAssinaturas()
    }
  }, [session])
  
  // Formatar status para exibição
  const formatStatus = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Ativa</Badge>
      case 'PENDENTE':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Pendente</Badge>
      case 'CANCELADA':
        return <Badge variant="destructive" className="flex items-center gap-1"><Ban className="h-3.5 w-3.5" /> Cancelada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  // Formatar método de pagamento
  const formatPaymentMethod = (method: string | null) => {
    if (!method) return 'N/A'
    
    switch (method) {
      case 'CARTAO':
        return <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Cartão</span>
      case 'PIX':
        return <span className="flex items-center gap-1"><Receipt className="h-3.5 w-3.5" /> Pix</span>
      case 'BOLETO':
        return <span className="flex items-center gap-1"><Receipt className="h-3.5 w-3.5" /> Boleto</span>
      default:
        return method
    }
  }
  
  // Definição das colunas
  const columns: ColumnDef<Assinatura>[] = [
    {
      id: 'espacoNome',
      accessorKey: 'espaco',
      header: 'Lojista',
      cell: ({ row }) => {
        const espaco = row.original.espaco
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={espaco.fotoPrincipal || ''} alt={espaco.nome} />
              <AvatarFallback>{espaco.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{espaco.nome}</div>
              <div className="text-xs text-muted-foreground">{espaco.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'plano.nome',
      header: 'Plano',
      cell: ({ row }) => {
        const plano = row.original.plano
        return (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{plano?.nome || 'N/A'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'dataInicio',
      header: 'Ativação',
      cell: ({ row }) => {
        const date = row.original.dataInicio
        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{format(date, 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'dataExpiracao',
      header: 'Expiração',
      cell: ({ row }) => {
        const date = row.original.dataExpiracao
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{format(date, 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'valor',
      header: 'Valor',
      cell: ({ row }) => {
        return formatCurrency(row.original.valor)
      },
    },
    {
      accessorKey: 'formaPagamento',
      header: 'Método',
      cell: ({ row }) => {
        return formatPaymentMethod(row.original.formaPagamento)
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return formatStatus(row.original.status)
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const assinatura = row.original
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              {assinatura.status === 'ATIVA' && (
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleCancelSubscription(assinatura.id)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Cancelar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
  
  // Filtrar assinaturas pelo termo de busca
  const filteredAssinaturas = assinaturas.filter(assinatura => 
    assinatura.espaco.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (assinatura.plano?.nome && assinatura.plano.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    assinatura.status.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Manipular cancelamento de assinatura
  const handleCancelSubscription = async (assinaturaId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) return
    
    try {
      const response = await fetch('/api/admin/assinaturas/cancelar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assinaturaId }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao cancelar assinatura')
      }
      
      toast.success('Assinatura cancelada com sucesso')
      
      // Atualizar lista
      setAssinaturas(prev => 
        prev.map(a => 
          a.id === assinaturaId 
            ? { ...a, status: 'CANCELADA', dataExpiracao: new Date() }
            : a
        )
      )
      
      // Atualizar contadores
      setTotalAtivas(prev => prev - 1)
      setTotalCanceladas(prev => prev + 1)
      
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao cancelar assinatura')
    }
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assinaturas</h1>
          <p className="text-muted-foreground">
            Gerencie as assinaturas de planos de todos os lojistas
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/admin/assinaturas/nova')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Assinatura
        </Button>
      </div>
      
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total de Assinaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assinaturas.length}</div>
            <p className="text-xs text-muted-foreground">
              Todas as assinaturas registradas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Assinaturas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{totalAtivas}</div>
            <p className="text-xs text-muted-foreground">
              Assinaturas válidas e em vigor
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Assinaturas Canceladas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalCanceladas}</div>
            <p className="text-xs text-muted-foreground">
              Assinaturas que foram canceladas
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar por lojista, plano ou status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Todas as Assinaturas</CardTitle>
          <CardDescription>
            Total de {filteredAssinaturas.length} assinaturas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredAssinaturas}
              searchKey="espacoNome"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
