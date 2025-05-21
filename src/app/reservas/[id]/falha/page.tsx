'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FalhaPage({ params }: { params: { id: string } }) {
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
        <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto">
          <AlertTriangle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">
          Falha no pagamento
        </h1>
        
        <p className="text-gray-500">
          Houve um problema ao processar seu pagamento. 
          Por favor, tente novamente ou escolha outra forma de pagamento.
          Você será redirecionado em alguns segundos...
        </p>

        <div className="pt-4 space-y-4">
          <Button
            onClick={() => router.push(`/reservas/${params.id}`)}
            className="w-full"
          >
            Tentar novamente
          </Button>
          
          <Button
            onClick={() => router.push("/ajuda")}
            variant="outline"
            className="w-full"
          >
            Preciso de ajuda
          </Button>
        </div>
      </div>
    </div>
  )
}
