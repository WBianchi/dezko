'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon, Clock, Sun, Calendar as CalendarIcon2 } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DateRange } from 'react-day-picker'

const formSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().default(""),
  porHora: z.object({
    ativo: z.boolean(),
    horaInicio: z.string().optional(),
    horaFim: z.string().optional(),
    valor: z.number().optional(),
    datas: z.object({
      from: z.date(),
      to: z.date(),
    }).optional(),
  }),
  porTurno: z.object({
    ativo: z.boolean(),
    turno: z.enum(['MANHA', 'TARDE', 'NOITE']).optional(),
    valor: z.number().optional(),
    datas: z.object({
      from: z.date(),
      to: z.date(),
    }).optional(),
  }),
  porDia: z.object({
    ativo: z.boolean(),
    valor: z.number().optional(),
    datas: z.object({
      from: z.date(),
      to: z.date(),
    }).optional(),
  }),
})

interface AddAgendaModalProps {
  children: React.ReactNode
}

export function AddAgendaModal({ children }: AddAgendaModalProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('hora')
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: "",
      porHora: { ativo: false },
      porTurno: { ativo: false },
      porDia: { ativo: false },
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Determinar o tipo de reserva e valores baseado na aba ativa
      let agendaData = {
        titulo: values.titulo,
        descricao: values.descricao,
      }

      if (values.porHora.ativo) {
        agendaData = {
          ...agendaData,
          tipoReserva: 'HORA',
          horaInicio: values.porHora.horaInicio,
          horaFim: values.porHora.horaFim,
          dataInicio: values.porHora.datas?.from,
          dataFim: values.porHora.datas?.to,
          valorHora: values.porHora.valor,
        }
      } else if (values.porTurno.ativo) {
        agendaData = {
          ...agendaData,
          tipoReserva: 'TURNO',
          turno: values.porTurno.turno,
          dataInicio: values.porTurno.datas?.from,
          dataFim: values.porTurno.datas?.to,
          valorTurno: values.porTurno.valor,
        }
      } else if (values.porDia.ativo) {
        agendaData = {
          ...agendaData,
          tipoReserva: 'DIA',
          dataInicio: values.porDia.datas?.from,
          dataFim: values.porDia.datas?.to,
          valorDia: values.porDia.valor,
        }
      }

      console.log('Enviando dados:', agendaData)

      await fetch('/api/espaco/agendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agendaData),
      })

      toast({
        title: "Sucesso",
        description: "Agenda criada com sucesso!"
      })
      setOpen(false)
      window.location.reload()
    } catch (error) {
      console.error('Erro ao criar agenda:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar agenda",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar Disponibilidade</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Disponibilidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Disponibilidade de Janeiro" {...field} />
                  </FormControl>
                  <FormDescription>
                    Dê um nome para identificar este conjunto de disponibilidades
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
                  <FormLabel>Descrição da Disponibilidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Disponibilidade para eventos" {...field} />
                  </FormControl>
                  <FormDescription>
                    Descreva a disponibilidade para que os clientes entendam melhor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hora" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Por Hora
                </TabsTrigger>
                <TabsTrigger value="turno" className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Por Turno
                </TabsTrigger>
                <TabsTrigger value="dia" className="flex items-center gap-2">
                  <CalendarIcon2 className="w-4 h-4" />
                  Por Dia
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hora" className="space-y-4">
                <FormField
                  control={form.control}
                  name="porHora.ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Disponível para Reserva por Hora
                        </FormLabel>
                        <FormDescription>
                          Permite que clientes reservem seu espaço por hora, definindo horário de início e fim
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('porHora.ativo') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="porHora.horaInicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário de Início</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="porHora.horaFim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário de Fim</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="porHora.valor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor por Hora</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              placeholder="R$ 0,00 por hora"
                            />
                          </FormControl>
                          <FormDescription>
                            Este valor será cobrado por cada hora de reserva
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="porHora.datas"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Período Disponível</FormLabel>
                          <FormControl>
                            <div className="grid gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value?.from ? (
                                      field.value.to ? (
                                        <>
                                          {format(field.value.from, "dd/MM/yyyy")} -{" "}
                                          {format(field.value.to, "dd/MM/yyyy")}
                                        </>
                                      ) : (
                                        format(field.value.from, "dd/MM/yyyy")
                                      )
                                    ) : (
                                      <span>Selecione um período</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={field.value?.from}
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    numberOfMonths={2}
                                    disabled={(date) => date < new Date()}
                                    locale={ptBR}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Escolha o período em que este horário estará disponível para reserva
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="turno" className="space-y-4">
                <FormField
                  control={form.control}
                  name="porTurno.ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Disponível para Reserva por Turno
                        </FormLabel>
                        <FormDescription>
                          Permite que clientes reservem seu espaço por turnos: manhã (8h-12h), tarde (13h-17h) ou noite (18h-22h)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('porTurno.ativo') && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="porTurno.turno"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Turno Disponível</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o turno" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MANHA">Manhã (8h às 12h)</SelectItem>
                              <SelectItem value="TARDE">Tarde (13h às 17h)</SelectItem>
                              <SelectItem value="NOITE">Noite (18h às 22h)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Escolha qual turno estará disponível para reserva
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="porTurno.valor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor por Turno</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              placeholder="R$ 0,00 por turno"
                            />
                          </FormControl>
                          <FormDescription>
                            Este valor será cobrado por cada turno reservado
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="porTurno.datas"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Período Disponível</FormLabel>
                          <FormControl>
                            <div className="grid gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value?.from ? (
                                      field.value.to ? (
                                        <>
                                          {format(field.value.from, "dd/MM/yyyy")} -{" "}
                                          {format(field.value.to, "dd/MM/yyyy")}
                                        </>
                                      ) : (
                                        format(field.value.from, "dd/MM/yyyy")
                                      )
                                    ) : (
                                      <span>Selecione um período</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={field.value?.from}
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    numberOfMonths={2}
                                    disabled={(date) => date < new Date()}
                                    locale={ptBR}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Escolha o período em que este turno estará disponível para reserva
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="dia" className="space-y-4">
                <FormField
                  control={form.control}
                  name="porDia.ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Disponível para Reserva por Dia
                        </FormLabel>
                        <FormDescription>
                          Permite que clientes reservem seu espaço por dias inteiros (24h)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('porDia.ativo') && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="porDia.valor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor por Dia</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              placeholder="R$ 0,00 por dia"
                            />
                          </FormControl>
                          <FormDescription>
                            Este valor será cobrado por cada dia de reserva
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="porDia.datas"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Período Disponível</FormLabel>
                          <FormControl>
                            <div className="grid gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value?.from ? (
                                      field.value.to ? (
                                        <>
                                          {format(field.value.from, "dd/MM/yyyy")} -{" "}
                                          {format(field.value.to, "dd/MM/yyyy")}
                                        </>
                                      ) : (
                                        format(field.value.from, "dd/MM/yyyy")
                                      )
                                    ) : (
                                      <span>Selecione um período</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={field.value?.from}
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    numberOfMonths={2}
                                    disabled={(date) => date < new Date()}
                                    locale={ptBR}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Escolha o período em que o espaço estará disponível para reserva por dia
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Button type="submit" className="w-full">
              Salvar Disponibilidade
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
