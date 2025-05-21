'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    MercadoPago: any
  }
}

export function useMercadoPago(publicKey: string) {
  const [mp, setMp] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (window.MercadoPago) {
      setMp(new window.MercadoPago(publicKey))
      setLoading(false)
      return
    }

    const script = document.createElement('script')
    script.src = "https://sdk.mercadopago.com/js/v2"
    script.type = "text/javascript"

    script.onload = () => {
      const mp = new window.MercadoPago(publicKey)
      setMp(mp)
      setLoading(false)
    }

    script.onerror = () => {
      setError("Erro ao carregar o SDK do Mercado Pago")
      setLoading(false)
    }

    document.body.appendChild(script)

    return () => {
      // Não remover o script ao desmontar para evitar problemas de carregamento
    }
  }, [publicKey])

  return { mp, error, loading }
}
