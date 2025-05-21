'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

export default function ReservasPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingCard />}>
        <StatusCard />
      </Suspense>
    </div>
  )
}

function LoadingCard() {
  return (
    <Card className="w-full max-w-md p-8 space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
    </Card>
  )
}

function StatusCard() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const status = searchParams.get('status')
  const paymentId = searchParams.get('payment_id')
  const collectionStatus = searchParams.get('collection_status')

  useEffect(() => {
    if (!status && !paymentId) {
      router.push('/dashboard/minhas-reservas')
    }
  }, [status, paymentId, router])

  if (!status && !paymentId) {
    return null
  }

  const getStatusInfo = () => {
    switch (status || collectionStatus) {
      case 'approved':
        return {
          title: 'Pagamento aprovado!',
          description: 'Sua reserva foi confirmada com sucesso.',
          icon: <CheckCircle2 className="h-12 w-12 text-green-500" />,
          buttonText: 'Ver minhas reservas',
          buttonColor: 'bg-green-500 hover:bg-green-600 text-white'
        }
      case 'pending':
        return {
          title: 'Pagamento pendente',
          description: 'Aguardando a confirmação do pagamento.',
          icon: <AlertCircle className="h-12 w-12 text-yellow-500" />,
          buttonText: 'Ver minhas reservas',
          buttonColor: 'bg-yellow-500 hover:bg-yellow-600 text-white'
        }
      case 'rejected':
        return {
          title: 'Pagamento recusado',
          description: 'Não foi possível processar o pagamento. Por favor, tente novamente.',
          icon: <XCircle className="h-12 w-12 text-red-500" />,
          buttonText: 'Tentar novamente',
          buttonColor: 'bg-red-500 hover:bg-red-600 text-white'
        }
      default:
        return {
          title: 'Status desconhecido',
          description: 'Não foi possível determinar o status do pagamento.',
          icon: <AlertCircle className="h-12 w-12 text-gray-500" />,
          buttonText: 'Ver minhas reservas',
          buttonColor: 'bg-gray-500 hover:bg-gray-600 text-white'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Card className="w-full max-w-md p-8 space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        {statusInfo.icon}
        <h1 className="text-2xl font-bold">{statusInfo.title}</h1>
        <p className="text-gray-600">{statusInfo.description}</p>
      </div>

      <Button
        className={`w-full ${statusInfo.buttonColor}`}
        onClick={() => router.push('/dashboard/minhas-reservas')}
      >
        {statusInfo.buttonText}
      </Button>
    </Card>
  )
}
