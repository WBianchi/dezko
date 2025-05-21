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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Percent, 
  CreditCard, 
  QrCode, 
  DollarSign,
  PlugZap, 
  Settings, 
  Building2
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"

// Schema para configuração global de comissões
const globalCommissionSchema = z.object({
  defaultType: z.enum(["percentage", "fixed", "plan"]),
  defaultValue: z.number().min(0),
  enablePlanCommission: z.boolean().default(false),
  defaultOpenPixWalletId: z.string().optional().nullable(),
})

// Schema para configuração do OpenPix
const openPixConfigSchema = z.object({
  enabled: z.boolean().default(true),
  walletId: z.string().optional().nullable(),
})

// Schema para configuração do Stripe
const stripeConfigSchema = z.object({
  enabled: z.boolean().default(true),
  accountId: z.string().optional().nullable(),
  commissionRate: z.number().min(0).max(100).default(10),
})

// Schema para configuração de planos
const planCommissionSchema = z.object({
  planId: z.string(),
  commissionType: z.enum(["percentage", "fixed"]),
  commissionValue: z.number().min(0),
})

// Schema para configurações específicas por espaço
const spaceCommissionSchema = z.object({
  spaceId: z.string(),
  commissionType: z.enum(["percentage", "fixed", "plan"]),
  commissionValue: z.number().min(0),
  customSplit: z.boolean().default(false),
})

// Schema completo do formulário
const configSchema = z.object({
  globalCommission: globalCommissionSchema,
  openPix: openPixConfigSchema,
  stripe: stripeConfigSchema,
  planCommissions: z.array(planCommissionSchema).optional(),
  spaceCommissions: z.array(spaceCommissionSchema).optional(),
})

type ConfigFormValues = z.infer<typeof configSchema>

export default function SplitConfigPage() {
  const queryClient = useQueryClient()
  
  // Buscando planos disponíveis
  const { data: planos, isLoading: planosLoading } = useQuery({
    queryKey: ['planos'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/admin/planos')
        return response.data
      } catch (error) {
        console.error('Erro ao buscar planos:', error)
        return []
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutos
  })

  // Buscando espaços disponíveis
  const { data: espacos, isLoading: espacosLoading } = useQuery({
    queryKey: ['espacos'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/admin/espacos')
        return response.data
      } catch (error) {
        console.error('Erro ao buscar espaços:', error)
        return []
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutos
  })

  // Buscando configuração atual
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['split-config'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/admin/config/split')
        return response.data
      } catch (error) {
        console.error('Erro ao buscar configurações:', error)
        return null
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutos
  })

  // Formulário
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      globalCommission: {
        defaultType: "percentage",
        defaultValue: 10,
        enablePlanCommission: false
      },
      openPix: {
        enabled: true
      },
      stripe: {
        enabled: true,
        commissionRate: 10
      },
      planCommissions: [],
      spaceCommissions: []
    }
  })

  // Atualizar formulário quando os dados forem carregados
  React.useEffect(() => {
    if (configData) {
      form.reset(configData)
    }
  }, [configData, form])

  // Mutação para salvar a configuração
  const saveMutation = useMutation({
    mutationFn: async (data: ConfigFormValues) => {
      const response = await axios.post('/api/admin/config/split', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-config'] })
      toast.success('Configurações salvas com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao salvar configurações')
      console.error('Erro ao salvar:', error)
    }
  })

  // Função para submeter o formulário
  const onSubmit = (data: ConfigFormValues) => {
    // Garantir que campos opcionais sejam tratados corretamente
    const cleanedData = {
      ...data,
      openPix: {
        ...data.openPix,
        walletId: data.openPix.walletId || null,
      },
      stripe: {
        ...data.stripe,
        accountId: data.stripe.accountId || null,
      },
      globalCommission: {
        ...data.globalCommission,
        defaultOpenPixWalletId: data.globalCommission.defaultOpenPixWalletId || null,
      }
    }
    
    console.log('Enviando configurações:', cleanedData)
    saveMutation.mutate(cleanedData)
  }

  // Verificar se o tipo de comissão é plano
  const isPlanCommission = form.watch('globalCommission.defaultType') === 'plan'
  const enablePlanCommission = form.watch('globalCommission.enablePlanCommission')

  // Renderizando
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Configurações de Split de Pagamentos</h1>
      </div>
      
      {configLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Carregando configurações...</span>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="global" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="global">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuração Global
                </TabsTrigger>
                <TabsTrigger value="openpix">
                  <QrCode className="w-4 h-4 mr-2" />
                  OpenPix (PIX)
                </TabsTrigger>
                <TabsTrigger value="stripe">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Stripe (Cartão)
                </TabsTrigger>
                <TabsTrigger value="spaces">
                  <Building2 className="w-4 h-4 mr-2" />
                  Por Espaço
                </TabsTrigger>
              </TabsList>
              
              {/* Configuração Global */}
              <TabsContent value="global" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuração de Comissão Global</CardTitle>
                    <CardDescription>
                      Configure a comissão padrão aplicada a todos os espaços
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="globalCommission.defaultType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Comissão Padrão</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de comissão" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">
                                <div className="flex items-center">
                                  <Percent className="w-4 h-4 mr-2" />
                                  Percentual
                                </div>
                              </SelectItem>
                              <SelectItem value="fixed">
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Valor Fixo (R$)
                                </div>
                              </SelectItem>
                              <SelectItem value="plan">
                                <div className="flex items-center">
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Por Plano
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Escolha como a comissão será calculada para todos os espaços
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {!isPlanCommission && (
                      <FormField
                        control={form.control}
                        name="globalCommission.defaultValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {form.watch('globalCommission.defaultType') === 'percentage' 
                                ? 'Percentual de Comissão (%)' 
                                : 'Valor Fixo da Comissão (R$)'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step={form.watch('globalCommission.defaultType') === 'percentage' ? '0.1' : '0.01'}
                                min="0"
                                max={form.watch('globalCommission.defaultType') === 'percentage' ? '100' : undefined}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              {form.watch('globalCommission.defaultType') === 'percentage' 
                                ? 'Percentual a ser cobrado sobre cada transação' 
                                : 'Valor fixo em reais a ser cobrado em cada transação'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <Separator className="my-4" />
                    
                    <FormField
                      control={form.control}
                      name="globalCommission.enablePlanCommission"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Comissões por Plano</FormLabel>
                            <FormDescription>
                              Habilite para definir comissões específicas por plano além da configuração global
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
                    
                    {enablePlanCommission && !planosLoading && planos?.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">Comissões por Plano</h3>
                        <div className="space-y-4">
                          {planos.map((plano: any, index: number) => (
                            <Card key={plano.id} className="overflow-hidden">
                              <CardHeader className="bg-muted/50 py-3">
                                <CardTitle className="text-base font-medium">{plano.nome}</CardTitle>
                                <Badge variant="outline" className="ml-2">
                                  R$ {plano.preco.toFixed(2)}
                                </Badge>
                              </CardHeader>
                              <CardContent className="p-4 grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`planCommissions.${index}.commissionType`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Tipo de Comissão</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value || "percentage"}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Tipo de comissão" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="percentage">Percentual (%)</SelectItem>
                                          <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`planCommissions.${index}.commissionValue`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Valor da Comissão</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          {...field}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <input 
                                  type="hidden" 
                                  {...form.register(`planCommissions.${index}.planId`)} 
                                  value={plano.id} 
                                />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Configuração OpenPix */}
              <TabsContent value="openpix" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Split do OpenPix</CardTitle>
                    <CardDescription>
                      Configure como os pagamentos via PIX serão divididos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="openPix.enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Habilitar Split de PIX</FormLabel>
                            <FormDescription>
                              Ative para dividir automaticamente os pagamentos via PIX entre a plataforma e os espaços
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
                    
                    <Alert>
                      <QrCode className="h-4 w-4" />
                      <AlertTitle>Informação sobre Sub-contas</AlertTitle>
                      <AlertDescription>
                        O OpenPix utiliza o conceito de "Sub-contas" para realizar splits. Cada espaço deve ter um ID de carteira 
                        (Wallet ID) configurado para receber sua parte do pagamento.
                      </AlertDescription>
                    </Alert>
                    
                    <FormField
                      control={form.control}
                      name="globalCommission.defaultOpenPixWalletId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID da Carteira Principal (Admin) <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Wallet ID da conta principal" {...field} />
                          </FormControl>
                          <FormDescription>
                            Este é o ID da carteira (Wallet ID) da conta principal do administrador da plataforma. Só é necessário se você quiser usar o split de PIX.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Configuração Opcional</AlertTitle>
                      <AlertDescription>
                        Para utilizar o split de pagamentos no OpenPix, você precisa ativar a funcionalidade "Sub-contas" 
                        no painel administrativo do OpenPix. Esta configuração é opcional e não afeta outras configurações como Stripe.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Configuração Stripe */}
              <TabsContent value="stripe" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Split do Stripe</CardTitle>
                    <CardDescription>
                      Configure como os pagamentos via cartão serão divididos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="stripe.enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Habilitar Split de Cartão</FormLabel>
                            <FormDescription>
                              Ative para dividir automaticamente os pagamentos via cartão entre a plataforma e os espaços
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
                    
                    <Alert>
                      <PlugZap className="h-4 w-4" />
                      <AlertTitle>Integração Stripe Connect</AlertTitle>
                      <AlertDescription>
                        O Stripe utiliza o Connect para realizar splits. Cada espaço deve estar integrado
                        via Stripe Connect para receber sua parte do pagamento.
                      </AlertDescription>
                    </Alert>
                    
                    <FormField
                      control={form.control}
                      name="stripe.accountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stripe Account ID (Admin) <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                          <FormControl>
                            <Input placeholder="acct_" {...field} />
                          </FormControl>
                          <FormDescription>
                            ID da conta Stripe do administrador da plataforma (ex: acct_123456). Só é necessário se você quiser usar o split de pagamentos com cartão.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="stripe.commissionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de aplicação do Stripe (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Taxa cobrada pelo Stripe sobre as transações (normalmente entre 2.9% e 3.5%)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Configuração por Espaço */}
              <TabsContent value="spaces" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Comissões por Espaço</CardTitle>
                    <CardDescription>
                      Configure comissões específicas para cada espaço 
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {espacosLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="ml-2">Carregando espaços...</span>
                      </div>
                    ) : espacos?.length > 0 ? (
                      <div className="space-y-4">
                        {espacos.map((espaco: any, index: number) => (
                          <Card key={espaco.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/50 py-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-medium">{espaco.nome}</CardTitle>
                                <FormField
                                  control={form.control}
                                  name={`spaceCommissions.${index}.customSplit`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2">
                                      <FormLabel className="text-sm">Comissão Personalizada</FormLabel>
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardHeader>
                            
                            {form.watch(`spaceCommissions.${index}.customSplit`) && (
                              <CardContent className="p-4 grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`spaceCommissions.${index}.commissionType`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Tipo de Comissão</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value || "percentage"}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Tipo de comissão" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="percentage">Percentual (%)</SelectItem>
                                          <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                                          <SelectItem value="plan">Por Plano</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                {form.watch(`spaceCommissions.${index}.commissionType`) !== 'plan' && (
                                  <FormField
                                    control={form.control}
                                    name={`spaceCommissions.${index}.commissionValue`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          {form.watch(`spaceCommissions.${index}.commissionType`) === 'percentage' 
                                            ? 'Percentual de Comissão (%)' 
                                            : 'Valor Fixo da Comissão (R$)'}
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )}
                                
                                <input 
                                  type="hidden" 
                                  {...form.register(`spaceCommissions.${index}.spaceId`)} 
                                  value={espaco.id} 
                                />
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Nenhum Espaço Encontrado</AlertTitle>
                        <AlertDescription>
                          Não há espaços cadastrados para configurar comissões personalizadas.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button 
              type="submit" 
              className="w-full md:w-auto" 
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : 'Salvar Configurações'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}