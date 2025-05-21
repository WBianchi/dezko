'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  CreditCard, 
  QrCode, 
  DollarSign, 
  Building2,
  Smartphone,
  RefreshCw
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"

interface MetodoPagamentoTabProps {
  espacoId?: string;
}

export function MetodoPagamentoTab({ espacoId }: MetodoPagamentoTabProps) {
  const queryClient = useQueryClient()
  
  // Estado de carregamento
  const [isLoading, setIsLoading] = React.useState(false)
  
  // Estados para controlar quais métodos estão habilitados
  const [metodos, setMetodos] = React.useState({
    pix: true,
    cartaoCredito: true,
    cartaoDebito: true
  })
  
  // Buscar configuração atual do espaço
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['espaco-metodos-pagamento', espacoId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/espacos/${espacoId}/metodos-pagamento`)
        return response.data
      } catch (error) {
        console.error('Erro ao buscar métodos de pagamento:', error)
        return null
      }
    },
    enabled: !!espacoId,
    staleTime: 1000 * 60 * 5 // 5 minutos
  })

  // Atualizar estados quando os dados forem carregados
  React.useEffect(() => {
    if (configData) {
      setMetodos({
        pix: configData.pix ?? true,
        cartaoCredito: configData.cartaoCredito ?? true,
        cartaoDebito: configData.cartaoDebito ?? true
      })
    }
  }, [configData])

  // Mutação para salvar configurações
  const saveConfigMutation = useMutation({
    mutationFn: async (data: typeof metodos) => {
      return axios.post(`/api/espacos/${espacoId}/metodos-pagamento`, data)
    },
    onSuccess: () => {
      toast.success("Métodos de pagamento atualizados com sucesso!")
      queryClient.invalidateQueries({ queryKey: ['espaco-metodos-pagamento', espacoId] })
    },
    onError: (error) => {
      console.error('Erro ao salvar métodos de pagamento:', error)
      toast.error("Erro ao atualizar métodos de pagamento")
    },
    onSettled: () => {
      setIsLoading(false)
    }
  })

  // Função para atualizar um método específico
  const handleMetodoChange = (metodo: keyof typeof metodos, value: boolean) => {
    setMetodos(prev => ({ ...prev, [metodo]: value }))
  }
  
  // Função para salvar as configurações
  const handleSave = () => {
    setIsLoading(true)
    saveConfigMutation.mutate(metodos)
  }

  // Se estiver carregando, exibir loader
  if (configLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Os métodos de pagamento que você habilitar estarão disponíveis para seus clientes
          no momento da compra ou reserva.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PIX */}
        <Card className={metodos.pix ? "border-primary" : undefined}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <QrCode className="h-5 w-5" />
                PIX
              </CardTitle>
              <Switch 
                checked={metodos.pix} 
                onCheckedChange={(checked) => handleMetodoChange('pix', checked)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Pagamento instantâneo via PIX, disponível 24/7
            </CardDescription>
            <div className="mt-2 flex items-center gap-1">
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                Instantâneo
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                Sem taxas adicionais
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Cartão de Crédito */}
        <Card className={metodos.cartaoCredito ? "border-primary" : undefined}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Cartão de Crédito
              </CardTitle>
              <Switch 
                checked={metodos.cartaoCredito} 
                onCheckedChange={(checked) => handleMetodoChange('cartaoCredito', checked)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Pagamento com cartões de crédito das principais bandeiras
            </CardDescription>
            <div className="mt-2 flex items-center gap-1">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                Parcelamento disponível
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Cartão de Débito */}
        <Card className={metodos.cartaoDebito ? "border-primary" : undefined}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Cartão de Débito
              </CardTitle>
              <Switch 
                checked={metodos.cartaoDebito} 
                onCheckedChange={(checked) => handleMetodoChange('cartaoDebito', checked)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Pagamento com cartões de débito das principais bandeiras
            </CardDescription>
            <div className="mt-2 flex items-center gap-1">
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                Confirmação rápida
              </Badge>
            </div>
          </CardContent>
        </Card>
        

      </div>
      
      <Separator />
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Configurações"
          )}
        </Button>
      </div>
    </div>
  )
}
