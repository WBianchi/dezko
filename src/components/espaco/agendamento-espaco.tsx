'use client'

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"
import { Clock } from "lucide-react"
import { ModalSelecaoPagamento } from "./modal-selecao-pagamento"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

interface Agenda {
  id: string
  titulo: string
  valorHora?: number | null
  valorTurno?: number | null
  valorDia?: number | null
}

interface AgendamentoEspacoProps {
  agendas: Agenda[]
  espacoId: string
}

type TipoReserva = "hora" | "turno" | "dia"

export function AgendamentoEspaco({ agendas, espacoId }: AgendamentoEspacoProps) {
  const [data, setData] = useState<Date>()
  const [tipoReserva, setTipoReserva] = useState<TipoReserva>()
  const [horario, setHorario] = useState<string>()
  const [agenda, setAgenda] = useState<Agenda>()
  const [modalSelecaoPagamentoAberto, setModalSelecaoPagamentoAberto] = useState(false)
  const [reservationId, setReservationId] = useState<string>()
  const { toast } = useToast()
  const { data: session } = useSession()

  // Filtra as agendas baseado no tipo de reserva selecionado
  const agendasFiltradas = agendas.filter(agenda => {
    if (tipoReserva === "hora") return agenda.valorHora
    if (tipoReserva === "turno") return agenda.valorTurno
    if (tipoReserva === "dia") return agenda.valorDia
    return false
  })

  // Calcula o valor baseado na agenda e tipo de reserva selecionados
  const getValor = () => {
    if (!agenda || !tipoReserva) return null
    if (tipoReserva === "hora") return agenda.valorHora
    if (tipoReserva === "turno") return agenda.valorTurno
    if (tipoReserva === "dia") return agenda.valorDia
    return null
  }

  const valor = getValor()

  // Lista de horários disponíveis (exemplo)
  const horarios = [
    "08:00", "09:00", "10:00", "11:00",
    "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00"
  ]

  // Lista de turnos disponíveis (exemplo)
  const turnos = ["Manhã (8h-12h)", "Tarde (13h-17h)", "Noite (18h-22h)"]

  // Mutation para criar a reserva
  const createReservation = useMutation({
    mutationFn: async () => {
      if (!data || !valor || !agenda) {
        throw new Error("Dados incompletos")
      }

      // Calcula a data de início e fim
      const dataInicio = new Date(data)
      const dataFim = new Date(data)

      if (tipoReserva === "hora") {
        const [hora, minuto] = horario!.split(":")
        dataInicio.setHours(parseInt(hora), parseInt(minuto), 0)
        dataFim.setHours(parseInt(hora) + 1, parseInt(minuto), 0)
      } else if (tipoReserva === "turno") {
        if (horario && horario.includes(" - ")) {
          const [horaInicio, minutoInicio] = horario.split(" - ")[0].split(":")
          const [horaFim, minutoFim] = horario.split(" - ")[1].split(":")
          dataInicio.setHours(parseInt(horaInicio), parseInt(minutoInicio), 0)
          dataFim.setHours(parseInt(horaFim), parseInt(minutoFim), 0)
        } else {
          // Para turnos como "Manhã (8h-12h)"
          if (horario === "Manhã (8h-12h)") {
            dataInicio.setHours(8, 0, 0)
            dataFim.setHours(12, 0, 0)
          } else if (horario === "Tarde (13h-17h)") {
            dataInicio.setHours(13, 0, 0)
            dataFim.setHours(17, 0, 0)
          } else if (horario === "Noite (18h-22h)") {
            dataInicio.setHours(18, 0, 0)
            dataFim.setHours(22, 0, 0)
          }
        }
      } else if (tipoReserva === "dia") {
        dataInicio.setHours(0, 0, 0)
        dataFim.setHours(23, 59, 59)
      }

      console.log("Dados da reserva:", {
        espacoId,
        dataInicio,
        dataFim,
        valor,
        agendaId: agenda.id,
      });

      try {
        const response = await fetch("/api/reservas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            espacoId,
            dataInicio,
            dataFim,
            valor,
            agendaId: agenda.id,
          }),
        });

        // Clone a resposta para poder ler o body duas vezes se necessário
        const responseClone = response.clone();

        if (!response.ok) {
          const errorData = await responseClone.json();
          throw new Error(errorData.error || "Erro ao criar reserva");
        }

        const responseData = await response.json();
        console.log("Resposta completa da API:", responseData);
        
        // Se tiver pedido na resposta, usar o id do pedido
        if (responseData && responseData.pedido) {
          console.log("Pedido e Reserva criados:", responseData);
          setReservationId(responseData.pedido.id);
          setModalSelecaoPagamentoAberto(true);
          return responseData;
        } 
        // Formato antigo (apenas pedido)
        else if (responseData && responseData.id) {
          console.log("Pedido criado (formato antigo):", responseData);
          setReservationId(responseData.id);
          setModalSelecaoPagamentoAberto(true);
          return responseData;
        }
        // Erro - formato desconhecido
        else {
          console.error("Formato de resposta inesperado:", responseData);
          throw new Error("Formato de resposta inesperado");
        }
      } catch (error) {
        console.error("Erro durante o processamento:", error);
        throw error;
      }
    },
    onSuccess: () => {},
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return (
    <>
      <div className="space-y-6">
        {/* Tipo de Reserva */}
        <div>
          <h3 className="font-medium mb-4">Tipo de Reserva</h3>
          <RadioGroup
            onValueChange={(value: TipoReserva) => {
              setTipoReserva(value)
              setAgenda(undefined)
              setHorario(undefined)
            }}
          >
            <div className="grid grid-cols-3 gap-4">
              {agendas.some(a => a.valorHora) && (
                <Label
                  htmlFor="hora"
                  className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-accent"
                >
                  <RadioGroupItem value="hora" id="hora" className="sr-only" />
                  <Clock className="h-6 w-6 mb-2" />
                  <span>Por Hora</span>
                </Label>
              )}
              {agendas.some(a => a.valorTurno) && (
                <Label
                  htmlFor="turno"
                  className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-accent"
                >
                  <RadioGroupItem value="turno" id="turno" className="sr-only" />
                  <Clock className="h-6 w-6 mb-2" />
                  <span>Por Turno</span>
                </Label>
              )}
              {agendas.some(a => a.valorDia) && (
                <Label
                  htmlFor="dia"
                  className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-accent"
                >
                  <RadioGroupItem value="dia" id="dia" className="sr-only" />
                  <Clock className="h-6 w-6 mb-2" />
                  <span>Por Dia</span>
                </Label>
              )}
            </div>
          </RadioGroup>
        </div>

        {/* Agenda */}
        {tipoReserva && agendasFiltradas.length > 0 && (
          <div>
            <h3 className="font-medium mb-4">Selecione a Agenda</h3>
            <RadioGroup
              onValueChange={(value) => {
                setAgenda(agendasFiltradas.find(a => a.id === value))
              }}
            >
              <div className="space-y-2">
                {agendasFiltradas.map((agenda) => (
                  <Label
                    key={agenda.id}
                    htmlFor={agenda.id}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent w-full"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={agenda.id} id={agenda.id} />
                      <span>{agenda.titulo}</span>
                    </div>
                    <span className="font-medium">
                      R$ {tipoReserva === "hora" ? agenda.valorHora?.toFixed(2) :
                          tipoReserva === "turno" ? agenda.valorTurno?.toFixed(2) :
                          agenda.valorDia?.toFixed(2)
                      }
                    </span>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Calendário */}
        {agenda && (
          <div>
            <h3 className="font-medium mb-4">Selecione a Data</h3>
            <Calendar
              mode="single"
              selected={data}
              onSelect={setData}
              locale={ptBR}
              className="border rounded-lg p-4"
            />
          </div>
        )}

        {/* Horários */}
        {data && tipoReserva === "hora" && (
          <div>
            <h3 className="font-medium mb-4">Selecione o Horário</h3>
            <div className="grid grid-cols-2 gap-2">
              {horarios.map((h) => (
                <Button
                  key={h}
                  variant={horario === h ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setHorario(h)}
                >
                  {h}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Turnos */}
        {data && tipoReserva === "turno" && (
          <div>
            <h3 className="font-medium mb-4">Selecione o Turno</h3>
            <div className="space-y-2">
              {turnos.map((t) => (
                <Button
                  key={t}
                  variant={horario === t ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setHorario(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Resumo */}
        {data && ((tipoReserva === "dia") || (tipoReserva !== "dia" && horario)) && valor && (
          <Card className="p-4">
            <h3 className="font-medium mb-4">Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data</span>
                <span>{format(data, "dd 'de' MMMM", { locale: ptBR })}</span>
              </div>
              {horario && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horário</span>
                  <span>{horario}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>R$ {valor.toFixed(2)}</span>
              </div>
            </div>
            <Button 
              className="w-full mt-4"
              onClick={() => createReservation.mutate()}
              disabled={createReservation.isPending}
            >
              {createReservation.isPending ? "Criando reserva..." : "Reservar Agora"}
            </Button>
          </Card>
        )}
      </div>

      {/* Modal de Seleção de Pagamento */}
      {reservationId && valor !== null && (
        <ModalSelecaoPagamento
          open={modalSelecaoPagamentoAberto}
          onOpenChange={setModalSelecaoPagamentoAberto}
          reservationId={reservationId}
          valor={valor}
        />
      )}
    </>
  )
}
