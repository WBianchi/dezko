'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import {
  ResponsiveContainer,
  ResponsiveHeader,
  ResponsiveForm
} from '@/components/dashboard/responsive-container'

const formSchema = z.object({
  nomeSite: z.string().min(1, 'Nome do site é obrigatório'),
  descricaoSite: z.string().min(1, 'Descrição do site é obrigatória'),
  emailContato: z.string().email('Email inválido'),
  telefoneContato: z.string().min(1, 'Telefone é obrigatório'),
  enderecoEmpresa: z.string().min(1, 'Endereço é obrigatório'),
})

type SettingsFormValues = z.infer<typeof formSchema>

export default function ConfiguracoesPage() {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeSite: 'Dezko',
      descricaoSite: 'Plataforma de aluguel de espaços para eventos',
      emailContato: 'contato@dezko.com',
      telefoneContato: '(11) 99999-9999',
      enderecoEmpresa: 'Rua Exemplo, 123 - São Paulo, SP',
    },
  })

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      // TODO: Implementar a API para salvar as configurações
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    }
  }

  return (
    <ResponsiveContainer>
      <ResponsiveHeader
        title="Configurações"
        subtitle="Gerencie as configurações do seu site"
      />
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <ResponsiveForm>
              <FormField
                control={form.control}
                name="nomeSite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Site</FormLabel>
                    <FormControl>
                      <Input placeholder="Dezko" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este é o nome que aparecerá no cabeçalho do site
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricaoSite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Site</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Plataforma de aluguel de espaços para eventos"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Uma breve descrição do seu site
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailContato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Contato</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contato@dezko.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Email para receber contatos do site
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefoneContato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone de Contato</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Telefone para contato
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enderecoEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço da Empresa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua Exemplo, 123 - São Paulo, SP"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Endereço físico da empresa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </ResponsiveForm>

          <div className="flex justify-end mt-8">
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              Salvar alterações
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveContainer>
  )
}
