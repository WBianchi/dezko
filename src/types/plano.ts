export interface Plano {
  id: string
  nome: string
  descricao: string
  valorMensal: number
  valorAnual: number
  preco: number
  duracao: number
  limiteAgendas?: number
  tipo: string
  status: string
  createdAt: Date
  updatedAt: Date
  espacoId?: string
  features?: string[]
  recursos?: string[]
}

export interface Assinatura {
  id: string
  createdAt: Date
  updatedAt: Date
  status: string
  dataInicio: Date
  dataExpiracao: Date
  valor: number
  espacoId: string
  planoId: string | null
  mercadoPagoPaymentId?: string | null
  mercadoPagoPreferenceId?: string | null
  stripeSubscriptionId?: string | null
  stripeCustomerId?: string | null
  stripePriceId?: string | null
  stripePaymentMethodId?: string | null
  formaPagamento?: 'PIX' | 'CARTAO' | 'BOLETO' | null
  espaco?: any
  plano?: Plano | null
}

export interface RenovacaoAssinatura {
  id: string
  createdAt: Date
  updatedAt: Date
  assinaturaId: string
  dataPagamento: Date
  valor: number
  mercadoPagoPaymentId?: string | null
  mercadoPagoPreferenceId?: string | null
  stripeInvoiceId?: string | null
  stripePaymentIntentId?: string | null
  formaPagamento?: 'PIX' | 'CARTAO' | 'BOLETO' | null
  status: string
}
