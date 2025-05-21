'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, CreditCard, CheckCircle2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import axios from "axios"

export function IntegracoesTab() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Mostrar toast de sucesso quando retornar do MP
  useEffect(() => {
    const success = searchParams.get("success")
    const message = searchParams.get("message")
    
    if (success === "true" && message) {
      toast({
        title: "Sucesso!",
        description: message,
        duration: 5000,
      })
    }
  }, [searchParams, toast])

  const { data: espaco } = useQuery({
    queryKey: ["espaco"],
    queryFn: async () => {
      const response = await axios.get(`/api/espacos/${session?.user?.espacoId}`)
      return response.data
    },
    enabled: !!session?.user?.espacoId
  })

  // Buscando configuração do Mercado Pago no servidor
  const { data: mercadoPagoConfig } = useQuery({
    queryKey: ["mercadopago-config"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/admin/config?tipo=mercadopago")
        return response.data
      } catch (error) {
        console.error("Erro ao obter configuração do Mercado Pago:", error)
        // Retornando valor padrão para continuar funcionando mesmo se a API falhar
        return { clientId: process.env.NEXT_PUBLIC_MERCADO_PAGO_APP_ID || "1623365362922759" }
      }
    }
  })

  const handleMercadoPagoConnect = () => {
    // Se não conseguimos as configurações via API, usamos a variável de ambiente
    const clientId = mercadoPagoConfig?.clientId || "1623365362922759"
    
    console.log("Conectando com o Mercado Pago usando ClientID:", clientId)

    const baseUrl = "https://auth.mercadopago.com.br/authorization"
    
    // Removendo o 'www.' da URL de redirecionamento para compatibilidade
    const origin = window.location.origin.replace('www.', '')
    const redirectUri = `${origin}/api/mercadopago/oauth`
    
    console.log("URL de redirecionamento ajustada:", redirectUri)
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      platform_id: "mp",
      redirect_uri: redirectUri,
      state: session?.user?.espacoId || ""
    })

    const url = `${baseUrl}?${params.toString()}`
    console.log("URL de autorização:", url)
    window.location.href = url
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrações</CardTitle>
        <CardDescription>Conecte-se com outros serviços</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <Calendar className="w-8 h-8" />
            <div>
              <h3 className="font-medium">Google Calendar</h3>
              <p className="text-sm text-muted-foreground">Sincronize suas reservas com o Google Calendar</p>
            </div>
          </div>
          <Button variant="outline">Conectar</Button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <MessageSquare className="w-8 h-8" />
            <div>
              <h3 className="font-medium">WhatsApp Business</h3>
              <p className="text-sm text-muted-foreground">Receba notificações via WhatsApp</p>
            </div>
          </div>
          <Button variant="outline">Conectar</Button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <CreditCard className={`w-8 h-8 ${espaco?.mercadoPagoAccessToken ? "text-green-500" : ""}`} />
            <div>
              <h3 className="font-medium">Mercado Pago</h3>
              <p className="text-sm text-muted-foreground">Processe pagamentos online</p>
              {espaco?.mercadoPagoAccessToken && (
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-green-600">Conectado</p>
                </div>
              )}
            </div>
          </div>
          <Button 
            variant="outline"
            disabled={!!espaco?.mercadoPagoAccessToken}
            onClick={handleMercadoPagoConnect}
          >
            Conectar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
