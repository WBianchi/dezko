import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

const prisma = new PrismaClient()

export default async function PaymentSuccessPage({
  params,
}: {
  params: { id: string }
}) {
  const reserva = await prisma.reservation.findUnique({
    where: { id: params.id },
    include: {
      espaco: true,
      plano: true,
    },
  })

  if (!reserva) {
    redirect("/")
  }

  return (
    <div className="container mx-auto max-w-2xl py-16">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pagamento Realizado!</h1>
        <p className="text-gray-600 mb-6">
          Sua reserva foi confirmada com sucesso.
        </p>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Espaço</p>
              <p className="font-medium">{reserva.espaco.nome}</p>
            </div>
            <div>
              <p className="text-gray-500">Valor</p>
              <p className="font-medium">R$ {reserva.valor.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Data de Início</p>
              <p className="font-medium">
                {new Date(reserva.dataInicio).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Data de Fim</p>
              <p className="font-medium">
                {new Date(reserva.dataFim).toLocaleDateString()}
              </p>
            </div>
            {reserva.plano && (
              <div className="col-span-2">
                <p className="text-gray-500">Plano</p>
                <p className="font-medium">{reserva.plano.nome}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 space-x-4">
          <Button asChild>
            <a href={`/espaco/${reserva.espaco.id}`}>
              Voltar para o Espaço
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/minhas-reservas">
              Ver Minhas Reservas
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
