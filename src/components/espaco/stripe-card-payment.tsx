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

interface StripeCardPaymentProps {
  isOpen: boolean
  onClose: () => void
  reservationId: string
  valor: number
  dadosPagador: {
    nome: string
    email: string
    cpf: string
  }
}

export function StripeCardPayment({ 
  isOpen, 
  onClose, 
  reservationId, 
  valor, 
  dadosPagador 
}: StripeCardPaymentProps) {
  
  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-blue-900/90 rounded-xl overflow-hidden w-full max-w-lg shadow-2xl border border-white/20">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Pagamento com Cartão</h2>
              <p className="text-white/70 text-sm">Preencha os dados do seu cartão de crédito</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/60 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <Elements stripe={stripePromise} options={stripeOptions}>
            <CardPaymentForm 
              onClose={onClose}
              reservationId={reservationId}
              valor={valor}
              dadosPagador={dadosPagador}
            />
          </Elements>
        </div>
      </div>
    </div>
  )
}

interface CardPaymentFormProps {
  onClose: () => void
  reservationId: string
  valor: number
  dadosPagador: {
    nome: string
    email: string
    cpf: string
  }
}

function CardPaymentForm({ onClose, reservationId, valor, dadosPagador }: CardPaymentFormProps) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  
  const [cardName, setCardName] = useState(dadosPagador?.nome || '')
  const [installments, setInstallments] = useState('1')
  const [processing, setProcessing] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  
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
          email: dadosPagador?.email
        },
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      if (!paymentMethod) {
        throw new Error('Falha ao criar método de pagamento')
      }
      
      // Enviar para o backend
      const response = await fetch('/api/stripe/card-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
          paymentMethodId: paymentMethod.id,
          installments: parseInt(installments),
          transactionAmount: valor,
          dadosPagador
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao processar pagamento')
      }
      
      toast.success("Pagamento processado com sucesso!")
      
      // Fechar modal e atualizar página
      setTimeout(() => {
        onClose()
        router.refresh()
      }, 1500)
      
    } catch (error) {
      console.error("Erro no pagamento:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento")
    } finally {
      setProcessing(false)
    }
  }
  
  // Calcular valor das parcelas
  const getInstallmentValue = (installments: string) => {
    const installmentValue = valor / parseInt(installments)
    return installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
        <div className="space-y-2 mb-4">
          <Label htmlFor="cardName" className="text-gray-700">Nome no Cartão</Label>
          <Input
            id="cardName"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Nome impresso no cartão"
            className="border-gray-300"
          />
        </div>
        
        {/* Parcelas */}
        <div className="space-y-2">
          <Label htmlFor="installments" className="text-gray-700">Parcelas</Label>
          <Select value={installments} onValueChange={setInstallments}>
            <SelectTrigger id="installments" className="w-full border-gray-300">
              <SelectValue placeholder="Selecione o número de parcelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">
                1x de {getInstallmentValue('1')} sem juros
              </SelectItem>
              <SelectItem value="2">
                2x de {getInstallmentValue('2')} sem juros
              </SelectItem>
              <SelectItem value="3">
                3x de {getInstallmentValue('3')} sem juros
              </SelectItem>
              <SelectItem value="6">
                6x de {getInstallmentValue('6')} sem juros
              </SelectItem>
              <SelectItem value="12">
                12x de {getInstallmentValue('12')} sem juros
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Valor total */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex justify-between items-center">
          <span className="text-blue-800 font-medium">Total a pagar:</span>
          <span className="text-blue-800 font-bold text-xl">
            {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
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
            'Pagar Agora'
          )}
        </Button>
      </div>
    </form>
  )
}
