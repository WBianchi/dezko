import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface UsePaymentStatusProps {
  reservaId: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function usePaymentStatus({ reservaId, onSuccess, onError }: UsePaymentStatusProps) {
  const [status, setStatus] = useState<string>("pending")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let interval: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/reservas/${reservaId}/status`)
        const data = await response.json()

        setStatus(data.status)

        if (data.status === "approved") {
          clearInterval(interval)
          onSuccess?.()
          router.push(`/reserva/${reservaId}/sucesso`)
        } else if (data.status === "rejected" || data.status === "cancelled") {
          clearInterval(interval)
          onError?.(data.status_detail || "Pagamento não aprovado")
        }
      } catch (error: any) {
        console.error("Erro ao verificar status:", error)
        onError?.(error.message || "Erro ao verificar status do pagamento")
      } finally {
        setLoading(false)
      }
    }

    // Verificar status a cada 5 segundos
    interval = setInterval(checkStatus, 5000)

    // Parar de verificar após 5 minutos
    const timeout = setTimeout(() => {
      clearInterval(interval)
      onError?.("Tempo limite de pagamento excedido")
    }, 5 * 60 * 1000)

    // Cleanup
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [reservaId])

  return { status, loading }
}
