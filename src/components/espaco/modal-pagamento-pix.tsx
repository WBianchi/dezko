"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { QrCode, RefreshCw } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Dialog, DialogContent } from "../ui/dialog"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { PixStatus } from "../ui/pix-status"

type Status = "pending" | "approved" | "rejected" | "cancelled" | null

interface ModalPixProps {
  reservationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  valor: number
  onSucesso?: () => void
  dadosPagador?: {
    nome: string
    email: string
    cpf: string
  }
}

export function ModalPagamentoPix({
  reservationId,
  open,
  onOpenChange,
  valor,
  onSucesso,
  dadosPagador,
}: ModalPixProps) {
  const router = useRouter()
  
  const [carregando, setCarregando] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<{
    chargeId: string
    qrCodeText: string
    qrCodeImage: string
    expirationDate: string
  } | null>(null)
  
  // Estado para controlar se deve usar QR code gerado localmente
  const [useLocalQrCode, setUseLocalQrCode] = useState(false)
  
  useEffect(() => {
    if (open && !qrCodeData && !carregando) {
      generatePixQrCode()
    }
  }, [open])
  
  // Verificar status do pagamento a cada 5 segundos
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    
    if (open && qrCodeData && status !== "approved") {
      intervalId = setInterval(() => {
        checkPaymentStatus()
      }, 5000) // A cada 5 segundos
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [open, qrCodeData, status])
  
  // Atualizar contador regressivo a cada segundo
  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (open && qrCodeData?.expirationDate && status !== "approved") {
      const updateCounter = () => {
        const now = new Date()
        const expiration = new Date(qrCodeData.expirationDate)
        
        if (now > expiration) {
          setTimeLeft("Expirado")
          return
        }
        
        const diff = Math.floor((expiration.getTime() - now.getTime()) / 1000)
        const minutes = Math.floor(diff / 60)
        const seconds = diff % 60
        
        setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
      }
      
      // Atualizar imediatamente e depois a cada segundo
      updateCounter()
      timer = setInterval(updateCounter, 1000)
    }
    
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [open, qrCodeData, status])

  const generatePixQrCode = async () => {
    setCarregando(true)
    setStatus("pending")
    
    try {
      // Adicionar um timestamp para evitar cache
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/openpix/pix?_=${timestamp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store"
        },
        body: JSON.stringify({
          pedidoId: reservationId,
          valor: valor,
          dadosPagador: dadosPagador || {}
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao gerar QR Code PIX")
      }
      
      const data = await response.json()
      console.log("Dados do PIX recebidos:", data)
      
      if (!data.success || !data.pixData) {
        throw new Error("Dados do QR Code PIX incompletos")
      }
      
      // Verificar campos importantes
      if (!data.pixData.chargeId) {
        console.warn("Aviso: chargeId não foi recebido da API")
        toast.warning("Dados incompletos recebidos do servidor. Algumas funcionalidades podem não funcionar corretamente.")
      }

      // Se não temos o código PIX, mostrar um aviso
      if (!data.pixData.pixCopiaECola) {
        console.warn("Aviso: Código PIX para cópia não foi recebido")
        toast.warning("O código PIX para cópia não foi gerado corretamente. Por favor, tente novamente.")
      }
      
      // Verificar QR Code Image
      if (!data.pixData.qrCodeImage) {
        console.warn("Aviso: URL da imagem do QR Code não foi recebida")
        // Tentar construir URL alternativa se tivermos o chargeId
        if (data.pixData.chargeId) {
          console.log("Tentando gerar URL alternativa do QR Code usando chargeId")
          data.pixData.qrCodeImage = `https://api.openpix.com.br/openpix/charge/${data.pixData.chargeId}/qrcode.png`
        } else {
          toast.warning("O QR Code não foi gerado corretamente. Por favor, use o código PIX para cópia.")
        }
      }
      
      setQrCodeData({
        chargeId: data.pixData.chargeId,
        qrCodeText: data.pixData.pixCopiaECola || '',
        qrCodeImage: data.pixData.qrCodeImage,
        expirationDate: data.pixData.expirationDate
      })
      
      // Se temos QR Code, verificar se ele carrega corretamente
      if (data.pixData.qrCodeImage) {
        const testImage = new window.Image()
        testImage.onload = () => console.log("QR Code carregado com sucesso")
        testImage.onerror = () => {
          console.warn("Não foi possível carregar o QR Code da URL fornecida")
          // Não mostrar toast aqui, pois o componente de imagem já tratará o erro
        }
        testImage.src = data.pixData.qrCodeImage
      }
      
    } catch (error) {
      toast.error("Erro ao gerar QR Code PIX")
      console.error("Erro detalhado:", error)
    } finally {
      setCarregando(false)
    }
  }

  const copyPixCode = () => {
    if (qrCodeData?.qrCodeText) {
      navigator.clipboard.writeText(qrCodeData.qrCodeText)
      setCopied(true)
      toast.success("Código PIX copiado!")
      
      // Resetar status de copiado após 3 segundos
      setTimeout(() => {
        setCopied(false)
      }, 3000)
    }
  }

  const checkPaymentStatus = async () => {
    if (!qrCodeData?.chargeId || status === "approved") return
    
    setVerifyingPayment(true)
    toast.loading("Verificando status do pagamento...")
    
    try {
      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/payment-status?id=${qrCodeData.chargeId}&_=${timestamp}`)
      
      if (!response.ok) {
        throw new Error("Falha ao verificar status do pagamento")
      }
      
      const data = await response.json()
      console.log("Resposta da verificação de status:", data)
      
      // Mostrar toast informativo com o status atual
      toast.dismiss()
      toast.info(`Status atual: ${data.openPixStatus || data.status}`)
      
      if (data.status === "approved") {
        setStatus("approved")
        toast.success("Pagamento aprovado!")
        
        // Chamar callback de sucesso se fornecido
        if (onSucesso) onSucesso()
        
        // Redirecionar ou atualizar UI conforme necessário
        setTimeout(() => {
          onOpenChange(false)
          router.refresh()
        }, 2000)
      } else if (data.status === "rejected") {
        setStatus("rejected")
        toast.error("Pagamento rejeitado")
      } else if (data.status === "pending") {
        // Se ainda estiver pendente, mostrar uma mensagem
        toast.info("O pagamento ainda não foi confirmado. Tente novamente em alguns instantes.")
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error)
      toast.dismiss()
      toast.error("Erro ao verificar status do pagamento")
    } finally {
      setVerifyingPayment(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/75 backdrop-blur-md border border-zinc-200 p-0 overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-zinc-900 text-center">Pagamento PIX</h2>
          <p className="text-zinc-600 text-center mt-2">
            Escaneie o QR Code ou copie o código PIX
          </p>
          
          <div className="mt-6 space-y-4">
            {status === "approved" ? (
              <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-emerald-50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-emerald-800">
                  Pagamento aprovado!
                </h3>
                <p className="text-emerald-600 text-center">
                  Seu pagamento foi processado com sucesso.
                </p>
              </div>
            ) : carregando ? (
              <div className="flex flex-col items-center justify-center space-y-4 p-6">
                <div className="w-16 h-16 border-4 border-t-zinc-800 border-zinc-200 rounded-full animate-spin"></div>
                <p className="text-zinc-600">Gerando QR Code PIX...</p>
              </div>
            ) : qrCodeData ? (
              <>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200">
                    {/* QR Code - Escolher entre imagem da API ou gerado localmente */}
                    {qrCodeData.qrCodeImage && !useLocalQrCode ? (
                      <div className="relative">
                        <img 
                          src={qrCodeData.qrCodeImage} 
                          alt="QR Code PIX" 
                          className="w-64 h-64 object-contain"
                          onError={(e) => {
                            console.error('Erro ao carregar imagem do QR Code');
                            const target = e.target as HTMLImageElement;
                            
                            // Tentativa de corrigir URL quebrada
                            const src = target.src;
                            console.log('URL do QR Code que falhou:', src);
                            
                            // Tentar URL alternativa baseada no chargeId
                            if (qrCodeData.chargeId) {
                              const newSrc = `https://api.openpix.com.br/openpix/charge/${qrCodeData.chargeId}/qrcode.png`;
                              console.log('Tentando URL alternativa:', newSrc);
                              if (src !== newSrc) {
                                target.src = newSrc;
                                return; // Dar outra chance antes de mostrar erro
                              }
                            }
                            
                            // Se não funcionou, mudar para o QR Code local
                            if (qrCodeData.qrCodeText) {
                              console.log('Alternando para QR Code gerado localmente');
                              setUseLocalQrCode(true);
                              return;
                            }
                            
                            target.onerror = null; // Evita loops infinitos
                            target.style.display = 'none';
                            
                            // Mostrar mensagem de erro onde estava a imagem
                            const parent = target.parentElement;
                            if (parent) {
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'w-64 h-64 flex flex-col items-center justify-center bg-zinc-100 rounded-lg';
                              errorDiv.innerHTML = `
                                <div class="text-zinc-500 mb-2">Não foi possível carregar o QR Code</div>
                                <div class="text-sm text-zinc-400">Use o código PIX abaixo</div>
                              `;
                              parent.appendChild(errorDiv);
                            }
                          }}
                        />
                        {/* Botões para recarregar QR Code ou alternar para QR Code local */}
                        <div className="absolute bottom-2 right-2 flex space-x-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              // Alternar para QR Code gerado localmente
                              if (qrCodeData.qrCodeText) {
                                setUseLocalQrCode(true);
                              }
                            }}
                            className="p-1 bg-white/80 rounded-full hover:bg-white text-zinc-500 hover:text-zinc-700 transition-colors"
                            title="Usar QR Code alternativo"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              const img = e.currentTarget.parentElement?.previousSibling as HTMLImageElement;
                              if (img) {
                                console.log('Recarregando QR Code...');
                                // Forçar recarga da imagem
                                const originalSrc = img.src;
                                img.src = '';
                                setTimeout(() => { img.src = originalSrc + '?t=' + new Date().getTime(); }, 100);
                              }
                            }}
                            className="p-1 bg-white/80 rounded-full hover:bg-white text-zinc-500 hover:text-zinc-700 transition-colors"
                            title="Recarregar QR Code"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : qrCodeData.qrCodeText ? (
                      <div className="relative bg-white p-4 rounded flex items-center justify-center">
                        {/* QR Code gerado localmente se temos o código PIX */}
                        <QRCodeSVG 
                          value={qrCodeData.qrCodeText} 
                          size={240}
                          includeMargin={true}
                          className="w-full h-full"
                          bgColor={"#FFFFFF"}
                          fgColor={"#000000"}
                          level={"H"}
                        />
                        {useLocalQrCode && (
                          <button 
                            onClick={() => setUseLocalQrCode(false)}
                            className="absolute bottom-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white text-zinc-500 hover:text-zinc-700 transition-colors"
                            title="Tentar imagem original"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-64 h-64 flex flex-col items-center justify-center bg-zinc-100 rounded-lg">
                        <QrCode className="w-16 h-16 text-zinc-400 mb-2" />
                        <p className="text-zinc-500 text-center text-sm">QR Code não disponível.<br/>Use o código PIX abaixo.</p>
                        <button 
                          onClick={() => generatePixQrCode()}
                          className="mt-3 px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-600 rounded-md hover:bg-blue-500/20"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full space-y-3">
                    <p className="text-sm text-zinc-600 text-center">
                      {timeLeft ? (
                        <>Expira em <span className="text-zinc-900 font-medium">{timeLeft}</span></>
                      ) : (
                        "Carregando tempo restante..."
                      )}
                    </p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        onClick={copyPixCode}
                        className="w-full relative overflow-hidden bg-gradient-to-r from-blue-500/10 to-green-500/10 border-blue-500/20 hover:border-green-500/30 hover:from-blue-500/20 hover:to-green-500/20"
                      >
                        {copied ? "Copiado ✓" : "Copiar código PIX"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={checkPaymentStatus}
                        disabled={verifyingPayment}
                        className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                      >
                        {verifyingPayment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-t-emerald-500 border-emerald-200 rounded-full animate-spin mr-2"></div>
                            Verificando...
                          </>
                        ) : (
                          "Atualizar status"
                        )}
                      </Button>
                      
                      {/* Status do pagamento */}
                      <div className="mt-3">
                        <PixStatus status={status || 'pending'} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <p className="text-sm text-zinc-600">
                    Não recebemos seu pagamento? Tente:
                  </p>
                  <ul className="text-sm text-zinc-600 list-disc pl-5 space-y-1">
                    <li>Verificar se há saldo suficiente</li>
                    <li>Usar outro aplicativo de banco</li>
                    <li>Atualizar o status após o pagamento</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 p-6">
                <p className="text-zinc-600">Erro ao carregar QR Code</p>
                <Button onClick={generatePixQrCode}>Tentar novamente</Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-zinc-50 p-4 flex items-center justify-between">
          <p className="text-zinc-600 text-sm">
            Valor: <span className="font-medium text-zinc-900">R$ {valor.toFixed(2).replace(".", ",")}</span>
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-zinc-500 hover:text-zinc-900"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
