'use client'

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { 
  AlertCircle, 
  Loader2, 
  Wallet,
  QrCode,
  Copy,
  Share2,
  ArrowUpRight
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"

// Schema para pagamento rápido
const pagamentoRapidoSchema = z.object({
  enabled: z.boolean().default(false),
  valor: z.coerce.number().min(1, "O valor mínimo é R$ 1,00"),
  descricao: z.string().min(3, "Descrição muito curta").max(100, "Descrição muito longa"),
  textoAgradecimento: z.string().min(3, "Texto muito curto").max(200, "Texto muito longo").optional(),
})

type PagamentoRapidoFormValues = z.infer<typeof pagamentoRapidoSchema>

interface PagamentoRapidoTabProps {
  espacoId?: string;
}

export function PagamentoRapidoTab({ espacoId }: PagamentoRapidoTabProps) {
  const queryClient = useQueryClient()
  
  // Estado para armazenar o link de pagamento gerado
  const [pagamentoLink, setPagamentoLink] = React.useState<string>("")
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("")
  
  // Buscar configuração atual do espaço
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['espaco-pagamento-rapido', espacoId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/espacos/${espacoId}/pagamento-rapido`)
        return response.data
      } catch (error) {
        console.error('Erro ao buscar configuração de pagamento rápido:', error)
        return null
      }
    },
    enabled: !!espacoId,
    staleTime: 1000 * 60 * 5 // 5 minutos
  })

  // Formulário com react-hook-form
  const form = useForm<PagamentoRapidoFormValues>({
    resolver: zodResolver(pagamentoRapidoSchema),
    defaultValues: {
      enabled: false,
      valor: 100,
      descricao: "Pagamento para espaço",
      textoAgradecimento: "Obrigado por seu pagamento!",
    }
  })
  
  // Atualizar formulário quando os dados forem carregados
  React.useEffect(() => {
    if (configData) {
      form.reset({
        enabled: configData.enabled ?? false,
        valor: configData.valor ?? 100,
        descricao: configData.descricao ?? "Pagamento para espaço",
        textoAgradecimento: configData.textoAgradecimento ?? "Obrigado por seu pagamento!",
      })
      
      if (configData.pagamentoLink) {
        setPagamentoLink(configData.pagamentoLink)
      }
      
      if (configData.qrCodeUrl) {
        setQrCodeUrl(configData.qrCodeUrl)
      }
    }
  }, [configData, form])

  // Mutação para salvar configurações
  const saveConfigMutation = useMutation({
    mutationFn: async (data: PagamentoRapidoFormValues) => {
      return axios.post(`/api/espacos/${espacoId}/pagamento-rapido`, data)
    },
    onSuccess: (response) => {
      toast.success("Configuração de pagamento rápido salva!")
      
      // Atualizar link de pagamento e QR code
      if (response.data.pagamentoLink) {
        setPagamentoLink(response.data.pagamentoLink)
      }
      
      if (response.data.qrCodeUrl) {
        setQrCodeUrl(response.data.qrCodeUrl)
      }
      
      queryClient.invalidateQueries({ queryKey: ['espaco-pagamento-rapido', espacoId] })
    },
    onError: (error) => {
      console.error('Erro ao salvar configuração:', error)
      toast.error("Erro ao salvar configuração de pagamento rápido")
    }
  })

  // Função para salvar o formulário
  function onSubmit(data: PagamentoRapidoFormValues) {
    saveConfigMutation.mutate(data)
  }
  
  // Função para copiar o link para o clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(pagamentoLink)
    toast.success("Link copiado para a área de transferência")
  }
  
  // Função para compartilhar o link
  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Link de pagamento",
          text: form.getValues("descricao"),
          url: pagamentoLink,
        })
        toast.success("Link compartilhado com sucesso")
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
      }
    } else {
      copyLinkToClipboard()
    }
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
        <AlertTitle>Pagamento Rápido</AlertTitle>
        <AlertDescription>
          Configure um link de pagamento rápido para compartilhar com seus clientes.
          Ideal para cobranças únicas ou doações.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Configuração do Pagamento
            </CardTitle>
            <CardDescription>
              Defina o valor e a descrição do seu link de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Ativar Pagamento Rápido
                        </FormLabel>
                        <FormDescription>
                          Permite receber pagamentos através de um link público
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch("enabled") && (
                  <>
                    <FormField
                      control={form.control}
                      name="valor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor (R$)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                step="0.01"
                                min="1"
                                {...field} 
                              />
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="text-gray-400">R$</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Valor que será cobrado no link de pagamento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Pagamento para Espaço XYZ" {...field} />
                          </FormControl>
                          <FormDescription>
                            Descrição que aparecerá no momento do pagamento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="textoAgradecimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem de Agradecimento</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ex: Obrigado por seu pagamento! Estamos ansiosos para recebê-lo." 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Texto que será exibido após o pagamento ser concluído
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      {saveConfigMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar e Gerar Link"
                      )}
                    </Button>
                  </>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {form.watch("enabled") && pagamentoLink && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Seu Link de Pagamento
              </CardTitle>
              <CardDescription>
                Compartilhe este link ou QR code com seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCodeUrl && (
                <div className="flex justify-center mb-4">
                  <div className="border p-2 inline-block rounded-md">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code para pagamento" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}
              
              <div className="relative">
                <Input 
                  value={pagamentoLink} 
                  readOnly 
                  className="pr-24"
                />
                <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyLinkToClipboard}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={shareLink}
                    className="h-8 w-8"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => window.open(pagamentoLink, '_blank')}
                    className="h-8 w-8"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-4">
                <div className="text-sm font-medium">Detalhes:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Valor:</div>
                  <div>R$ {form.getValues("valor").toFixed(2)}</div>
                  
                  <div className="text-muted-foreground">Descrição:</div>
                  <div>{form.getValues("descricao")}</div>
                </div>
              </div>
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Dica</AlertTitle>
                <AlertDescription>
                  Este link pode ser compartilhado em redes sociais, WhatsApp, email ou impresso como QR Code.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
