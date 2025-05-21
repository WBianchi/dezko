'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, QrCode, User, Mail, ArrowRight, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { StripeCardPayment } from "@/components/espaco/stripe-card-payment"
import { ModalPagamentoPix } from "@/components/espaco/modal-pagamento-pix"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

interface ModalSelecaoPagamentoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservationId: string
  valor: number
  tipoAssinatura?: boolean
  usuarioEmail?: string
  usuarioNome?: string
}

// Schema para validação dos dados do pagador
const pagadorSchema = z.object({
  nome: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  cpf: z.string().min(11, { message: "CPF inválido" })
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, { message: "Formato de CPF inválido" })
})

export function ModalSelecaoPagamento({ open, onOpenChange, reservationId, valor, tipoAssinatura = false, usuarioEmail, usuarioNome }: ModalSelecaoPagamentoProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>(null)
  const [step, setStep] = useState<'dados' | 'metodo'>('dados')
  
  // Formatação de CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  // Formatação de CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 5) return numbers
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }
  
  // Uso do React Hook Form com validação Zod
  const form = useForm<z.infer<typeof pagadorSchema>>({
    resolver: zodResolver(pagadorSchema),
    defaultValues: {
      nome: usuarioNome || "",
      email: usuarioEmail || "",
      cpf: ""
    },
  })
  

  
  // Função para avançar para a seleção do método de pagamento
  const avancarParaMetodoPagamento = (data: z.infer<typeof pagadorSchema>) => {
    // Salva os dados na sessão para uso posterior
    sessionStorage.setItem('dadosPagador', JSON.stringify(data))
    setStep('metodo')
    toast.success("Dados salvos com sucesso!")
  }
  
  const MetodoPagamento = ({ 
    icon: Icon, 
    title, 
    description, 
    onClick, 
    color 
  }: { 
    icon: React.ElementType, 
    title: string, 
    description: string, 
    onClick: () => void, 
    color: string 
  }) => (
    <motion.div
      className={`bg-white/10 backdrop-blur-sm p-6 rounded-xl cursor-pointer border border-white/20 hover:border-white/40 transition-all relative overflow-hidden ${color === 'blue' ? 'hover:bg-blue-500/10' : 'hover:bg-green-500/10'}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color === 'blue' ? 'bg-blue-500/20 text-blue-200' : 'bg-green-500/20 text-green-200'}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-white">{title}</h3>
          <p className="text-sm text-white/70">{description}</p>
        </div>
      </div>
    </motion.div>
  )

  return (
    <>
      {/* Modal principal com steps */}
      {!paymentMethod && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[500px] min-h-[400px] bg-gradient-to-br from-blue-900/80 via-indigo-800/70 to-green-900/80 backdrop-blur-lg border border-white/20 shadow-xl relative overflow-hidden fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-h-[85vh] overflow-y-auto">
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
                className="absolute w-40 h-40 rounded-full bg-green-500/20 blur-xl"
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
                {step === 'dados' ? 'Seus dados para pagamento' : 'Escolha como pagar'}
              </DialogTitle>
              <DialogDescription className="text-white/80">
                {step === 'dados' 
                  ? 'Complete seus dados para prosseguir com o pagamento' 
                  : 'Selecione a forma de pagamento para sua reserva'}
              </DialogDescription>
            </DialogHeader>

            {/* Etapa 1: Formulário de dados do pagador */}
            {step === 'dados' && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(avancarParaMetodoPagamento)} className="space-y-4 relative z-10">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Nome completo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-2 top-3 h-4 w-4 text-white/40" />
                            <Input 
                              placeholder="Seu nome completo" 
                              className="pl-8 bg-white/10 border-white/20 text-white" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-2 top-3 h-4 w-4 text-white/40" />
                            <Input 
                              placeholder="seu@email.com" 
                              className="pl-8 bg-white/10 border-white/20 text-white" 
                              type="email"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">CPF</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Shield className="absolute left-2 top-3 h-4 w-4 text-white/40" />
                            <Input
                              placeholder="000.000.000-00"
                              className="pl-8 bg-white/10 border-white/20 text-white"
                              value={field.value}
                              onChange={(e) => {
                                const formatted = formatCPF(e.target.value)
                                field.onChange(formatted)
                              }}
                              maxLength={14}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
                    >
                      Continuar <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Etapa 2: Seleção de método de pagamento */}
            {step === 'metodo' && (
              <div className="grid gap-4 relative z-10">
                <MetodoPagamento
                  icon={CreditCard}
                  title="Cartão de Crédito"
                  description="Pague em até 12x com os principais cartões"
                  onClick={() => {
                    console.log('Clicou em Cartão de Crédito')
                    setPaymentMethod('card')
                    console.log('paymentMethod definido como:', 'card')
                  }}
                  color="blue"
                />
                
                {/* Se não for tipo assinatura, mostre a opção de PIX */}
                {!tipoAssinatura && (
                  <MetodoPagamento
                    icon={QrCode}
                    title="PIX"
                    description="Pagamento instantâneo com QR Code"
                    onClick={() => setPaymentMethod('pix')}
                    color="green"
                  />
                )}
                
                {tipoAssinatura && (
                  <div className="text-white text-sm bg-blue-500/20 p-3 rounded-lg">
                    <p className="flex items-center"><Shield className="mr-2 h-4 w-4" /> Assinaturas de planos são processadas via cartão de crédito para garantir renovações automáticas.</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="text-center text-xs text-white/60 mt-2 relative z-10">
              Valor total: <span className="font-bold text-white">R$ {valor.toFixed(2)}</span>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Componente de Pagamento com Cartão */}
      <StripeCardPayment
        isOpen={paymentMethod === 'card'}
        onClose={() => {
          setPaymentMethod(null)
          onOpenChange(false)
        }}
        reservationId={reservationId}
        valor={valor}
        dadosPagador={form.getValues() as any}
      />
      
      {/* Componente de Pagamento PIX */}
      {!tipoAssinatura && (
        <ModalPagamentoPix
          open={paymentMethod === 'pix'}
          onOpenChange={(open) => {
            if (!open) {
              setPaymentMethod(null)
              onOpenChange(false)
            }
          }}
          reservationId={reservationId}
          valor={valor}
          dadosPagador={form.getValues() as any}
          onSucesso={() => {
            toast.success("Pagamento PIX confirmado!")
            onOpenChange(false)
          }}
        />
      )}
      
      {/* Apenas para debug em desenvolvimento */}
      {process.env.NODE_ENV !== 'production' && paymentMethod === 'card' && (
        <div className="fixed top-0 left-0 bg-black/80 text-white p-2 text-xs z-50">
          Debug: Stripe Card Payment ativo
        </div>
      )}
      
      {process.env.NODE_ENV !== 'production' && paymentMethod === 'pix' && (
        <div className="fixed top-0 left-0 bg-black/80 text-white p-2 text-xs z-50">
          Debug: PIX Payment ativo
        </div>
      )}
    </>
  )
}
