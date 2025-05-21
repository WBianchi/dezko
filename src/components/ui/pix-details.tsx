'use client'

import { useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Skeleton } from './skeleton'
import { QrCode, Clock, CreditCard, RefreshCcw, Copy, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

// Tipo para os dados do pagamento PIX
type PixDetails = {
  qrCodeImage: string
  qrCodeText: string
  pixCopiaECola: string
  expirationDate: string
  chargeId: string
}

interface PixDetailsProps {
  pixId: string
  onStatusChange?: (status: 'pending' | 'approved' | 'rejected' | 'cancelled') => void
}

export function PixDetails({ pixId, onStatusChange }: PixDetailsProps) {
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<PixDetails | null>(null)
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'cancelled'>('pending')
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Carregar detalhes do pagamento
  const loadDetails = async () => {
    if (!pixId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/payment-details?id=${pixId}`)
      if (!response.ok) {
        throw new Error('Falha ao carregar detalhes do pagamento')
      }
      
      const data = await response.json()
      setDetails(data.pixData)
      
      if (data.status) {
        setStatus(data.status)
        if (onStatusChange) {
          onStatusChange(data.status)
        }
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar detalhes do pagamento')
    } finally {
      setLoading(false)
    }
  }
  
  // Verificar status do pagamento
  const checkStatus = async () => {
    if (!pixId) return
    
    setRefreshing(true)
    try {
      const response = await fetch(`/api/payment-status?id=${pixId}`)
      if (!response.ok) {
        throw new Error('Falha ao verificar status do pagamento')
      }
      
      const data = await response.json()
      setStatus(data.status || 'pending')
      
      if (data.status === 'approved') {
        toast.success('Pagamento aprovado!')
      } else if (data.status === 'rejected' || data.status === 'cancelled') {
        toast.error('Pagamento rejeitado ou cancelado')
      } else {
        toast.info('Pagamento ainda pendente')
      }
      
      if (onStatusChange) {
        onStatusChange(data.status || 'pending')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao verificar status de pagamento')
    } finally {
      setRefreshing(false)
    }
  }
  
  // Copiar código PIX
  const copyPixCode = () => {
    if (!details?.pixCopiaECola) return
    
    navigator.clipboard.writeText(details.pixCopiaECola)
    setCopied(true)
    toast.success('Código PIX copiado!')
    
    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }
  
  // Carregar detalhes na montagem inicial
  if (!details && !loading) {
    loadDetails()
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-64 w-64" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    )
  }
  
  if (!details) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagamento PIX</CardTitle>
          <CardDescription>
            Ocorreu um erro ao carregar os detalhes do pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={loadDetails}>Tentar novamente</Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pagamento PIX</CardTitle>
            <CardDescription>
              {status === 'approved' 
                ? 'Pagamento aprovado' 
                : status === 'rejected' 
                  ? 'Pagamento rejeitado' 
                  : status === 'cancelled'
                    ? 'Pagamento cancelado'
                    : 'Escaneie o QR Code ou copie o código PIX'}
            </CardDescription>
          </div>
          <div className="rounded-full p-2 bg-green-50">
            <QrCode className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {status === 'approved' ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-green-50 rounded-lg">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-medium text-green-800">
              Pagamento aprovado!
            </h3>
            <p className="text-green-600 text-center">
              Seu pagamento foi processado com sucesso.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 mb-4">
              {details.qrCodeImage ? (
                <img 
                  src={details.qrCodeImage} 
                  alt="QR Code PIX" 
                  className="w-64 h-64 object-contain"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-zinc-100 rounded-lg">
                  <QrCode className="w-16 h-16 text-zinc-400" />
                </div>
              )}
            </div>
            
            <div className="w-full space-y-3">
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  onClick={copyPixCode}
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar código PIX
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={checkStatus}
                  disabled={refreshing}
                  className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                >
                  {refreshing ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Atualizar status
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Clock className="mr-1 h-3 w-3" />
          <span>ID: {details.chargeId.substring(0, 10)}...</span>
        </div>
        <div className="flex items-center">
          <CreditCard className="mr-1 h-3 w-3" />
          <span>OpenPix</span>
        </div>
      </CardFooter>
    </Card>
  )
}
