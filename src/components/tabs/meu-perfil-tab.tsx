'use client'

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
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { IMaskInput } from "react-imask"
// Removido InputMask devido a problemas de compatibilidade
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(14, "Telefone é obrigatório e deve estar no formato (99) 99999-9999"),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  website: z.string().optional(),
  whatsapp: z.string().optional(),
  cep: z.string().min(8, "CEP inválido").optional(),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  capacidade: z.string().optional(),
})

interface Estado {
  id: number
  sigla: string
  nome: string
}

interface Cidade {
  id: number
  nome: string
}

export function MeuPerfilTab() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      descricao: "",
      categoria: "PADRAO",
      website: "",
      whatsapp: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      capacidade: "",
    }
  })

  // Carregar estados do IBGE
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
        const data = await res.json()
        setEstados(data)
      } catch (error) {
        console.error('Erro ao carregar estados:', error)
      }
    }
    
    fetchEstados()
  }, [])
  
  // Carregar dados do espaço
  useEffect(() => {
    const fetchEspacoData = async () => {
      if (!session?.user) return
      
      try {
        setLoading(true)
        console.log("Buscando dados do espaço para o usuário:", session.user)
        
        const res = await fetch('/api/espaco')
        
        if (!res.ok) {
          console.error(`Erro na API: ${res.status} ${res.statusText}`)
          const errorText = await res.text().catch(() => "")
          console.error("Resposta da API:", errorText)
          throw new Error(`Erro ao buscar dados do espaço: ${res.status} ${res.statusText}`)
        }
        
        const data = await res.json()
        console.log("Dados do espaço recebidos:", data)
        
        // Verifica se data tem as propriedades esperadas
        if (data) {
          const formData = {
            ...data,
            // Garantir que campos estejam no formato correto para o formulário
            capacidade: data.capacidade?.toString() || "",
            telefone: data.telefone || "",
            website: data.website || "",
            whatsapp: data.whatsapp || "",
            complemento: data.complemento || "",
            numero: data.numero || "",
          }
          
          console.log("Atualizando formulário com:", formData)
          form.reset(formData)
          
          // Carregar cidades do estado atual
          if (data.estado) {
            const estado = estados.find(e => e.sigla === data.estado)
            if (estado) {
              carregarCidades(estado.id)
            }
          }
        }
      } catch (error: unknown) {
        console.error('Erro ao buscar dados do espaço:', error)
        toast({
          title: "Erro",
          description: `Não foi possível carregar os dados do perfil: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchEspacoData()
  }, [session, estados, form, toast])

  const carregarCidades = async (estadoId: number) => {
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`)
    const data = await res.json()
    setCidades(data)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true)
    try {
      console.log("Preparando dados para envio:", values)
      
      // Prepare the data for API
      const dataToSend = {
        ...values,
        // Convert capacidade to number if it exists
        capacidade: values.capacidade ? values.capacidade : undefined,
        // Garantir que número e complemento sejam enviados
        numero: values.numero || "",
        complemento: values.complemento || ""
      }
      
      console.log("Enviando dados para API:", dataToSend)
      
      const res = await fetch('/api/espaco', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      console.log(`Resposta da API: ${res.status} ${res.statusText}`)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error("Texto da resposta de erro:", errorText)
        
        let errorMessage = 'Erro ao atualizar perfil'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          console.error("Erro ao processar resposta JSON:", e)
        }
        
        throw new Error(errorMessage)
      }

      const responseData = await res.json()
      console.log("Dados da resposta de sucesso:", responseData)

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      })
    } catch (error: unknown) {
      console.error('Erro ao atualizar perfil:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar perfil",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome de usuário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(99) 99999-9999" 
                    value={field.value}
                    onChange={(e) => {
                      // Aplicar máscara de telefone manualmente
                      const value = e.target.value
                        .replace(/\D/g, '') // Remove caracteres não numéricos
                        .replace(/^(\d{2})(\d)/g, '($1) $2') // Coloca parênteses em volta dos dois primeiros dígitos
                        .replace(/(\d{5})(\d)/, '$1-$2') // Coloca hífen depois de 5 dígitos
                        .replace(/(-\d{4})\d+?$/, '$1'); // Limita a 11 dígitos
                      
                      field.onChange(value);
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>
                  Formato: (99) 99999-9999
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidade</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Capacidade" 
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Número máximo de pessoas que o espaço comporta
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva seu espaço" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <IMaskInput 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="00000-000" 
                      mask="00000-000"
                      inputMode="numeric"
                      value={field.value || ''}
                      onAccept={(value: string) => field.onChange(value)}
                      unmask={false}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value)
                    const estado = estados.find(e => e.sigla === value)
                    if (estado) {
                      carregarCidades(estado.id)
                    }
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {estados.map(estado => (
                      <SelectItem key={estado.id} value={estado.sigla}>
                        {estado.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cidades.map(cidade => (
                      <SelectItem key={cidade.id} value={cidade.nome}>
                        {cidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bairro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input placeholder="Bairro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="Número" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="complemento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento</FormLabel>
                <FormControl>
                  <Input placeholder="Complemento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </form>
    </Form>
  )
}
