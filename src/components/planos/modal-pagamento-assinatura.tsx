'use client'

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plano } from "@/types/plano"

// Carregando Stripe fora do componente
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// Opções para customização do Stripe Elements
const stripeOptions = {
  appearance: {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#4f46e5',
      colorBackground: '#1e293b',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
    },
  },
  locale: 'pt-BR' as 'pt-BR',
}

interface ModalPagamentoAssinaturaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plano: Plano | null
  tipoAssinatura: 'mensal' | 'anual'
}

export function ModalPagamentoAssinatura({ 
  open, 
  onOpenChange, 
  plano, 
  tipoAssinatura 
}: ModalPagamentoAssinaturaProps) {
  if (!plano) return null
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-blue-900/90 border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Assinatura de Plano</DialogTitle>
          <DialogDescription className="text-white/70">
            Assinatura {tipoAssinatura === 'mensal' ? 'mensal' : 'anual'} do plano {plano.nome}
          </DialogDescription>
        </DialogHeader>
        
        <Elements stripe={stripePromise} options={stripeOptions}>
          <AssinaturaCheckoutForm 
            onClose={() => onOpenChange(false)}
            plano={plano}
            tipoAssinatura={tipoAssinatura}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}

interface AssinaturaCheckoutFormProps {
  onClose: () => void
  plano: Plano
  tipoAssinatura: 'mensal' | 'anual'
}

function AssinaturaCheckoutForm({ onClose, plano, tipoAssinatura }: AssinaturaCheckoutFormProps) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  
  const [cardName, setCardName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  
  // Calcular valor
  const valor = tipoAssinatura === 'mensal' 
    ? plano.valorMensal 
    : plano.valorAnual
  
  // Lidar com mudanças no componente de cartão
  const handleCardChange = (event: { error?: { message: string } }) => {
    setCardError(event.error ? event.error.message : null)
  }
  
  // Processar pagamento
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      toast.error("O sistema de pagamento não está carregado")
      return
    }
    
    if (!cardName.trim()) {
      toast.error("Nome no cartão é obrigatório")
      return
    }
    
    setProcessing(true)
    
    try {
      const cardElement = elements.getElement(CardElement)
      
      if (!cardElement) {
        throw new Error('Elemento do cartão não encontrado')
      }
      
      // Criar um PaymentMethod com o Stripe
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardName,
        },
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      if (!paymentMethod) {
        throw new Error('Falha ao criar método de pagamento')
      }
      
      // Enviar para o backend
      const response = await fetch('/api/stripe/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planoId: plano.id,
          paymentMethodId: paymentMethod.id,
          tipoAssinatura: tipoAssinatura,
          cardName: cardName
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao processar assinatura')
      }
      
      const result = await response.json()
      
      // Se precisar de autenticação adicional
      if (result.requiresAction) {
        const { error: actionError, paymentIntent } = await stripe.confirmCardPayment(
          result.clientSecret
        )
        
        if (actionError) {
          throw new Error(actionError.message || 'Falha na autenticação do cartão')
        }
      }
      
      toast.success("Assinatura realizada com sucesso!")
      
      // Fechar modal e redirecionar
      setTimeout(() => {
        onClose()
        router.push('/dashboard/espaco/meu-plano')
      }, 1500)
      
    } catch (error) {
      console.error("Erro na assinatura:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao processar assinatura")
    } finally {
      setProcessing(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-lg p-5 shadow-md">
        {/* Card Element */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="cardElement" className="text-gray-700">Dados do Cartão</Label>
          <div className="border border-gray-300 rounded-md p-3 bg-white">
            <CardElement 
              id="cardElement"
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#32325d',
                    fontFamily: 'system-ui, sans-serif',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a',
                  },
                },
              }}
              onChange={handleCardChange}
            />
          </div>
          {cardError && (
            <p className="text-red-500 text-sm">{cardError}</p>
          )}
        </div>
        
        {/* Nome no cartão */}
        <div className="space-y-2">
          <Label htmlFor="cardName" className="text-gray-700">Nome no Cartão</Label>
          <Input
            id="cardName"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Nome impresso no cartão"
            className="border-gray-300"
          />
        </div>
      </div>
      
      {/* Valor total */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-blue-800 font-medium">Plano:</span>
            <span className="text-blue-800 font-semibold">{plano.nome}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-800 font-medium">Recorrência:</span>
            <span className="text-blue-800 font-semibold">
              {tipoAssinatura === 'mensal' ? 'Mensal' : 'Anual'}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
            <span className="text-blue-800 font-medium">Total:</span>
            <span className="text-blue-800 font-bold text-xl">
              {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      </div>
      
      {/* Botões */}
      <div className="flex gap-3 justify-end">
        <Button 
          type="button" 
          variant="outline"
          onClick={onClose}
          disabled={processing}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={processing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </>
          ) : (
            'Assinar Agora'
          )}
        </Button>
      </div>
    </form>
  )
}
