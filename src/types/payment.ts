export type PaymentMethod = 'pix' | 'credit_card'
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded'
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Reservation {
  id: string
  spaceId: string
  userId: string
  date: Date
  startTime: string
  endTime: string
  status: ReservationStatus
  createdAt: Date
  updatedAt: Date
  payment?: Payment
}

export interface Payment {
  id: string
  reservationId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  paymentData: any // Dados específicos do método de pagamento
  createdAt: Date
  updatedAt: Date
}

export interface MercadoPagoConfig {
  accessToken: string
  publicKey: string
  clientId: string
  clientSecret: string
  webhookSecret: string
}

export interface SpaceConfig {
  id: string
  mercadoPago?: {
    connected: boolean
    sellerId?: string
    accessToken?: string
  }
}
