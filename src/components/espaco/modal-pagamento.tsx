'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, ArrowRight, User, Check, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

interface ModalPagamentoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservationId: string
  valor: number
  dadosPagador?: {
    nome: string
    email: string
    cpf: string
  }
}

// Carregamos o Stripe dinamicamente para garantir que a chave seja carregada corretamente
const getStripePromise = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  console.log('Carregando Stripe com chave:', key ? 'Configurada (pk_*****)' : 'Não configurada');
  return loadStripe(key, { locale: 'pt-BR' });
};

const stripePromise = getStripePromise();

// Opções para o Stripe Elements
const stripeOptions = {
  appearance: {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#4f46e5',
      colorBackground: 'rgba(15, 23, 42, 0.7)',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, ui-sans-serif, system-ui',
      borderRadius: '0.5rem',
    },
  },
};

export function ModalPagamento({ open, onOpenChange, reservationId, valor, dadosPagador }: ModalPagamentoProps) {
  const [stripeReady, setStripeReady] = useState(false);
  
  // Log de montagem do componente
  useEffect(() => {
    console.log('ModalPagamento montado', { open, reservationId, valor });
    
    return () => {
      console.log('ModalPagamento desmontado');
    };
  }, []);
  
  // Log quando a prop open mudar
  useEffect(() => {
    console.log('Prop "open" mudou para:', open);
  }, [open]);
  
  useEffect(() => {
    // Verificar se a chave do Stripe está configurada ao montar o componente
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.log('Chave do Stripe encontrada, configurando componente');
      setStripeReady(true);
    } else {
      console.error('Chave publicável do Stripe não está configurada');
      toast.error('Erro ao carregar o processador de pagamentos');
    }
  }, []);
  
  // Exibir informações de debug para desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.log('Estado atual do ModalPagamento:', {
      stripeReady,
      open,
      reservationId,
      valor,
      dadosPagador,
      stripeKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Configurada' : 'Não configurada'
    });
  }
  
  if (!stripeReady) {
    console.log('Stripe não está pronto, mostrando tela de carregamento');
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] min-h-[300px] bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-900/80 backdrop-blur-lg border border-white/20 shadow-xl relative overflow-hidden w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-extrabold text-white tracking-tight">
              Carregando Stripe...
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Aguarde enquanto carregamos o processador de pagamentos.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-300"></div>
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  console.log('Renderizando formulário Stripe', {
    aberto: open,
    stripe: !!stripePromise,
    options: stripeOptions
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] min-h-[500px] bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-900/80 backdrop-blur-lg border border-white/20 shadow-xl relative overflow-hidden w-[90vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pagamento com Cartão</DialogTitle>
          <DialogDescription>Preencha os dados do cartão para finalizar a reserva</DialogDescription>
        </DialogHeader>
        
        <Elements stripe={stripePromise} options={stripeOptions}>
          <CartaoCheckoutForm 
            onOpenChange={onOpenChange}
            reservationId={reservationId}
            valor={valor}
            dadosPagador={dadosPagador}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}

type CartaoCheckoutFormProps = Omit<ModalPagamentoProps, 'open'>;

// Formulário de checkout com Stripe Elements
function CartaoCheckoutForm({ onOpenChange, reservationId, valor, dadosPagador }: CartaoCheckoutFormProps) {
  const router = useRouter()
  const [cardName, setCardName] = useState('')
  const [installments, setInstallments] = useState('1')
  const [processing, setProcessing] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  
  // Hooks do Stripe
  const stripe = useStripe()
  const elements = useElements()
  
  // Função para lidar com mudanças no elemento do cartão
  const handleCardChange = (event: { error?: { message: string } }) => {
    setCardError(event.error ? event.error.message : null);
  };

  const processPayment = async () => {
    if (!validateForm()) return
    
    setProcessing(true)
    
    try {
      if (!stripe || !elements) {
        throw new Error('Stripe não está carregado');
      }
      
      // Obter o elemento do cartão e criar um PaymentMethod
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Elemento do cartão não encontrado');
      }
      
      // Criar um PaymentMethod usando o Stripe Elements
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardName,
          email: dadosPagador?.email
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!paymentMethod) {
        throw new Error('Falha ao criar método de pagamento');
      }

      // Enviar o token para o backend em vez dos dados do cartão
      const response = await fetch(`/api/pagamentos/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
          paymentMethodId: paymentMethod.id,  // Enviar o ID do método de pagamento
          installments: parseInt(installments),
          dadosPagador: dadosPagador || {
            nome: cardName,
            email: '',
            cpf: ''
          }
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao processar pagamento')
      }
      
      toast.success("Pagamento processado com sucesso!")
      
      // Redirecionar após pagamento bem-sucedido
      setTimeout(() => {
        onOpenChange(false)
        router.refresh()
      }, 1500)
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento")
      console.error("Erro:", error)
    } finally {
      setProcessing(false)
    }
  }

  const validateForm = () => {
    if (!stripe || !elements) {
      toast.error("Sistema de pagamento não carregado");
      return false;
    }
    
    if (!cardName.trim()) {
      toast.error("Nome no cartão é obrigatório");
      return false;
    }
    
    if (cardError) {
      toast.error(cardError);
      return false;
    }
    
    return true;
  }

  // Calcular valor das parcelas
  const getInstallmentAmount = (installments: string) => {
    const installmentValue = valor / parseInt(installments)
    return installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div>
      {/* Bolhas de animação */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-blue-400/20 blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ left: '10%', top: '20%' }}
        />
        <motion.div
          className="absolute w-40 h-40 rounded-full bg-blue-500/20 blur-xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ right: '5%', bottom: '10%' }}
        />
      </div>
      
      <DialogHeader className="relative z-10">
        <DialogTitle className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Dados do Cartão
        </DialogTitle>
        <DialogDescription className="text-blue-100/80">
          Preencha os dados do seu cartão para finalizar a reserva
        </DialogDescription>
      </DialogHeader>

      <div className="relative z-10 space-y-4 mt-2">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="space-y-4">
            {/* Stripe Card Element */}
            <div className="space-y-2">
              <Label htmlFor="cardElement">Dados do Cartão</Label>
              <div className="relative p-4 border border-gray-300 rounded-md">
                <CardElement
                  id="cardElement"
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#32325d',
                        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
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
                {cardError && (
                  <p className="text-red-500 text-xs mt-2">{cardError}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no Cartão</Label>
              <div className="relative">
                <Input
                  id="cardName"
                  placeholder="Nome como está no cartão"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  className="pl-10"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Select value={installments} onValueChange={setInstallments}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione as parcelas" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}x de {getInstallmentAmount((i + 1).toString())}
                      {i === 0 ? ' (sem juros)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-white/10 p-4 rounded-lg backdrop-blur-sm">
          <span className="text-blue-100/90">Valor total</span>
          <span className="text-xl font-bold text-white">R$ {valor.toFixed(2)}</span>
        </div>
        
        <Button 
          onClick={processPayment} 
          className="w-full py-6 bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
          disabled={processing}
        >
          {processing ? (
            <span className="flex items-center">
              <div className="h-5 w-5 border-2 border-blue-200 border-t-transparent rounded-full animate-spin mr-2"></div>
              Processando...
            </span>
          ) : (
            <span className="flex items-center">
              Finalizar Pagamento
              <ArrowRight className="ml-2 h-5 w-5" />
            </span>
          )}
        </Button>
        
        <div className="text-center text-xs text-blue-100/80 flex items-center justify-center">
          <span className="rounded-full bg-white/20 p-1 mr-1.5">
            <Shield className="h-3 w-3 text-blue-100/80" />
          </span>
          Pagamento seguro processado pelo Stripe
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4 text-gray-200 text-sm space-y-2 border border-white/20">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-400" />
            <span>Cancelamento grátis até 24h antes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-400" />
            <span>Confirmação instantânea</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-400" />
            <span>Seus dados estão seguros e criptografados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
