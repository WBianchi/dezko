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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  CreditCard, 
  DollarSign,
  Wallet,
  Link as LinkIcon,
  ExternalLink
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"
import Link from "next/link"

// Funções para formatar chaves PIX
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/([\d]{3})([\d]{3})([\d]{3})([\d]{2})/, '$1.$2.$3-$4')
    .substring(0, 14);
};

const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/([\d]{2})([\d]{3})([\d]{3})([\d]{4})([\d]{2})/, '$1.$2.$3/$4-$5')
    .substring(0, 18);
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/([\d]{2})([\d]{5})([\d]{4})/, '($1) $2-$3')
    .substring(0, 15);
};

// Função para retornar o placeholder adequado conforme o tipo de chave PIX
const getPixKeyPlaceholder = (pixKeyType: string | null | undefined): string => {
  switch (pixKeyType) {
    case "CPF":
      return "Ex: 123.456.789-01";
    case "CNPJ":
      return "Ex: 12.345.678/0001-90";
    case "EMAIL":
      return "Ex: seu@email.com";
    case "TELEFONE":
      return "Ex: (11) 98765-4321";
    case "CHAVE_ALEATORIA":
      return "Ex: 123e4567-e89b-12d3-a456-426614174000";
    default:
      return "Digite sua chave PIX";
  }
};

// Schema para configuração de pagamentos do espaço
const configSchema = z.object({
  // OpenPix - Agora com campos para configurar PIX
  openPixEnabled: z.boolean().default(false),
  pixKey: z.string().optional().nullable(),
  pixKeyType: z.enum(["CPF", "CNPJ", "EMAIL", "TELEFONE", "CHAVE_ALEATORIA"]).optional().nullable(),
  // Stripe
  stripeEnabled: z.boolean().default(false),
  stripeAccountId: z.string().optional().nullable(),
  stripeConnectStatus: z.enum(["pending", "connected", "disconnected"]).optional().default("pending"),
})

type ConfigFormValues = z.infer<typeof configSchema>

interface ConfigPagamentosTabProps {
  espacoId?: string;
}

export function ConfigPagamentosTab({ espacoId }: ConfigPagamentosTabProps) {
  const queryClient = useQueryClient()
  
  // Estado de carregamento
  const [isSaving, setIsSaving] = React.useState(false)
  
  // Buscar configuração atual do espaço
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['espaco-config-pagamentos', espacoId],
    queryFn: async () => {
      try {
        // Esta é uma rota que precisamos criar para buscar as configurações do espaço
        const response = await axios.get(`/api/espacos/${espacoId}/config-pagamentos`)
        return response.data
      } catch (error) {
        console.error('Erro ao buscar configurações:', error)
        return null
      }
    },
    enabled: !!espacoId,
    staleTime: 1000 * 60 * 5 // 5 minutos
  })

  // Formulário com react-hook-form
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      openPixEnabled: false,
      stripeEnabled: false,
      stripeAccountId: "",
      stripeConnectStatus: "pending",
    }
  })
  
  // Atualizar formulário quando os dados forem carregados
  React.useEffect(() => {
    if (configData) {
      form.reset({
        openPixEnabled: configData.openPixEnabled || false,
        stripeEnabled: configData.stripeEnabled || false,
        stripeAccountId: configData.stripeAccountId || "",
        stripeConnectStatus: configData.stripeConnectStatus || "pending",
      })
    }
  }, [configData, form])

  // Mutação para salvar configurações
  const saveConfigMutation = useMutation({
    mutationFn: async (data: ConfigFormValues) => {
      // Esta é uma rota que precisamos criar para salvar as configurações do espaço
      return axios.post(`/api/espacos/${espacoId}/config-pagamentos`, data)
    },
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!")
      queryClient.invalidateQueries({ queryKey: ['espaco-config-pagamentos', espacoId] })
    },
    onError: (error) => {
      console.error('Erro ao salvar configurações:', error)
      toast.error("Erro ao salvar configurações")
    },
    onSettled: () => {
      setIsSaving(false)
    }
  })

  // Função para salvar o formulário
  function onSubmit(data: ConfigFormValues) {
    // Garantir que valores nulos são transformados em strings vazias para o Input
    const cleanedData = {
      ...data,
      stripeAccountId: data.stripeAccountId || "",
      stripeConnectStatus: data.stripeConnectStatus || "pending"
    }
    
    setIsSaving(true)
    saveConfigMutation.mutate(cleanedData)
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pagamentos via PIX */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Pagamentos via PIX
                </CardTitle>
                <CardDescription>
                  Ative para receber pagamentos via PIX instantaneamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="openPixEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Ativar recebimento via PIX
                        </FormLabel>
                        <FormDescription>
                          Permite recebimento via PIX com QR Code
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
                
                {form.watch("openPixEnabled") && (
                  <>
                    {/* Tipo de Chave PIX */}
                    <FormField
                      control={form.control}
                      name="pixKeyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Chave PIX</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || "CPF"}
                            value={field.value || "CPF"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de chave PIX" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CPF">CPF</SelectItem>
                              <SelectItem value="CNPJ">CNPJ</SelectItem>
                              <SelectItem value="EMAIL">E-mail</SelectItem>
                              <SelectItem value="TELEFONE">Telefone</SelectItem>
                              <SelectItem value="CHAVE_ALEATORIA">Chave Aleatória</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Selecione o tipo de chave PIX que você usará para receber
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Chave PIX com máscara de acordo com o tipo */}
                    <FormField
                      control={form.control}
                      name="pixKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chave PIX para recebimento</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={getPixKeyPlaceholder(form.watch("pixKeyType"))} 
                              {...field} 
                              value={field.value || ''}
                              onChange={(e) => {
                                const pixKeyType = form.watch("pixKeyType");
                                let value = e.target.value;
                                
                                // Aplicar máscaras de acordo com o tipo
                                if (pixKeyType === "CPF") {
                                  value = maskCPF(value);
                                } else if (pixKeyType === "CNPJ") {
                                  value = maskCNPJ(value);
                                } else if (pixKeyType === "TELEFONE") {
                                  value = maskPhone(value);
                                }
                                
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Informe a chave PIX que receberá os pagamentos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <AlertTitle>Tudo pronto para receber via PIX!</AlertTitle>
                      <AlertDescription>
                        Os clientes poderão pagar suas compras através de QR Code PIX. Os valores serão transferidos para sua conta automaticamente.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Configuração do Stripe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Configuração do Stripe
                </CardTitle>
                <CardDescription>
                  Configure sua integração com o Stripe para pagamentos com cartão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="stripeEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Ativar Stripe
                        </FormLabel>
                        <FormDescription>
                          Permite recebimento via cartão de crédito e débito
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
                
                {form.watch("stripeEnabled") && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="stripeAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID da Conta Stripe Connect</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input readOnly placeholder="Ex: acct_xxxxxxxxxxxxx" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                            </FormControl>
                            {field.value && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => window.open("https://dashboard.stripe.com", "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                                Dashboard
                              </Button>
                            )}
                          </div>
                          <FormDescription>
                            ID da sua conta Connect no Stripe
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {!form.watch("stripeAccountId") && (
                      <div className="pt-4">
                        <Link
                          href={`/api/stripe/connect/oauth?espacoId=${espacoId}`}
                          passHref
                        >
                          <Button type="button" className="flex items-center gap-2 w-full bg-violet-600 hover:bg-violet-700">
                            <LinkIcon className="h-4 w-4" />
                            Conectar com Stripe
                          </Button>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-2">
                          Conecte sua conta Stripe para receber pagamentos diretamente na sua conta bancária.
                        </p>
                      </div>
                    )}
                    
                    {form.watch("stripeAccountId") && (
                      <>
                        <Alert className="bg-green-50 border-green-200 text-green-800">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertTitle>Conta Conectada</AlertTitle>
                          <AlertDescription>
                            Sua conta Stripe está conectada e pronta para receber pagamentos.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="pt-4">
                          <Button 
                            type="button" 
                            variant="destructive"
                            className="flex items-center gap-2 w-full"
                            onClick={async () => {
                              try {
                                // Confirmação antes de desconectar
                                if (!confirm("Tem certeza que deseja desconectar sua conta Stripe? Isso impedirá o recebimento de pagamentos por cartão.")) {
                                  return;
                                }
                                
                                const response = await axios.post(`/api/stripe/connect/disconnect`, {
                                  espacoId: espacoId
                                });
                                
                                if (response.status === 200) {
                                  toast.success("Conta Stripe desconectada com sucesso");
                                  form.setValue("stripeAccountId", null);
                                  queryClient.invalidateQueries({ queryKey: ['espacoConfig', espacoId] });
                                }
                              } catch (error) {
                                console.error("Erro ao desconectar conta Stripe:", error);
                                toast.error("Erro ao desconectar conta Stripe");
                              }
                            }}
                          >
                            <LinkIcon className="h-4 w-4" />
                            Desconectar do Stripe
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {!form.watch("stripeAccountId") && form.watch("stripeEnabled") && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Informação</AlertTitle>
                    <AlertDescription>
                      Para receber pagamentos com cartão, é necessário vincular uma conta Stripe Connect. Clique no botão acima para conectar.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
          

          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Configurações"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
