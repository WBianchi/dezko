'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  planoId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddEspacoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  initialData?: FormValues & { id?: string }
}

export function AddEspacoModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
}: AddEspacoModalProps) {
  const [planos, setPlanos] = useState<{id: string, nome: string, preco: number}[]>([])
  const [isLoadingPlanos, setIsLoadingPlanos] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const title = initialData ? 'Editar Espaço' : 'Adicionar Espaço'
  const description = initialData
    ? 'Edite as informações do espaço'
    : 'Adicione um novo espaço'
  const action = initialData ? 'Salvar mudanças' : 'Adicionar'

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      planoId: '',
    },
  })

  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        setError(null)
        setIsLoadingPlanos(true)
        const response = await fetch('/api/admin/planos')
        
        if (!response.ok) {
          throw new Error('Erro ao buscar planos')
        }
        
        const data = await response.json()
        if (!data || !Array.isArray(data)) {
          console.error('Dados de planos inválidos:', data)
          setError('Formato de dados inválido')
          setPlanos([])
          return
        }
        
        setPlanos(data)
      } catch (error) {
        console.error('Erro ao buscar planos:', error)
        setError((error as Error).message || 'Erro desconhecido')
        toast.error('Não foi possível carregar os planos')
        setPlanos([])
      } finally {
        setIsLoadingPlanos(false)
      }
    }
    
    if (isOpen) {
      fetchPlanos()
    } else {
      // Limpar o estado quando o modal é fechado
      setPlanos([])
      setError(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (initialData) {
      form.reset({
        nome: initialData.nome,
        email: initialData.email,
        senha: '',
        planoId: initialData.planoId || '',
      })
    }
  }, [initialData, form])

  const onSubmit = async (data: FormValues) => {
    try {
      if (initialData) {
        const response = await fetch(`/api/admin/espacos/${initialData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Erro ao atualizar espaço')
        }

        toast.success('Espaço atualizado com sucesso')
      } else {
        const response = await fetch('/api/admin/espacos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Erro ao criar espaço')
        }

        toast.success('Espaço criado com sucesso')
      }

      form.reset()
      onConfirm()
      onClose()
    } catch (error) {
      toast.error('Algo deu errado')
    }
  }

  return (
    <Modal
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          disabled={form.formState.isSubmitting}
                          placeholder="Nome do espaço"
                          {...field}
                        />
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
                        <Input
                          disabled={form.formState.isSubmitting}
                          placeholder="Email do espaço"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {initialData ? 'Nova Senha' : 'Senha'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={form.formState.isSubmitting}
                          placeholder={
                            initialData
                              ? 'Digite a nova senha'
                              : 'Digite a senha'
                          }
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="planoId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Plano</FormLabel>
                      <Select
                        disabled={isLoadingPlanos}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {error ? (
                            <div className="p-2 text-sm text-red-500">Erro: {error}</div>
                          ) : isLoadingPlanos ? (
                            <div className="p-2 text-sm">Carregando planos...</div>
                          ) : planos && planos.length > 0 ? (
                            planos.map((plano) => (
                              <SelectItem key={plano.id} value={plano.id}>
                                {plano.nome} - {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(plano.preco)}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm">Nenhum plano encontrado</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button
                  disabled={form.formState.isSubmitting}
                  variant="outline"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button disabled={form.formState.isSubmitting} type="submit">
                  {action}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Modal>
  )
}
