'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PendentePage({ params }: { params: { id: string } }) {
  const router = useRouter()

  useEffect(() => {
    // Após 5 segundos, redireciona para a página da reserva
    const timeout = setTimeout(() => {
      router.push(`/reservas/${params.id}`)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [params.id, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-yellow-100 rounded-full p-4 w-20 h-20 mx-auto">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">
          Pagamento em processamento
        </h1>
        
        <p className="text-gray-500">
          Seu pagamento está sendo processado. Assim que confirmado, 
          sua reserva será automaticamente atualizada.
          Você será redirecionado em alguns segundos...
        </p>

        <div className="pt-4">
          <Button
            onClick={() => router.push(`/reservas/${params.id}`)}
            className="w-full"
          >
            Ver detalhes da reserva
          </Button>
        </div>
      </div>
    </div>
  )
}
