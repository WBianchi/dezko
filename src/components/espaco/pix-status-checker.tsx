'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PixStatusCheckerProps {
  pixId: string;
  reservationId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PixStatusChecker({
  pixId,
  reservationId,
  onSuccess,
  onError,
}: PixStatusCheckerProps) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'error'>('pending');
  const [message, setMessage] = useState<string>('Aguardando confirmação do pagamento...');
  const [checking, setChecking] = useState<boolean>(true);
  const [checkCount, setCheckCount] = useState<number>(0);
  const router = useRouter();

  // Função para verificar o status do pagamento
  const checkPaymentStatus = async () => {
    try {
      console.log('Verificando status do pagamento:', pixId);
      const response = await fetch(`/api/mercadopago/pix?pixId=${pixId}`);
      const data = await response.json();
      
      if (data.error) {
        setStatus('error');
        setMessage(data.error);
        setChecking(false);
        if (onError) onError(data.error);
        return;
      }
      
      console.log('Resposta da verificação:', data);
      
      if (data.status === 'approved') {
        setStatus('approved');
        setMessage('Pagamento confirmado com sucesso! Sua reserva foi atualizada para PAGO.');
        setChecking(false);
        if (onSuccess) onSuccess();
        
        // Atualizar a UI para mostrar que a reserva foi atualizada
        router.refresh();
      } else {
        // Continuar verificando se ainda estiver pendente
        setStatus('pending');
        setCheckCount((prev) => prev + 1);
        
        // Se já verificou mais de 20 vezes (cerca de 2 minutos), parar de verificar
        if (checkCount > 20) {
          setChecking(false);
          setMessage('O tempo de verificação expirou. Você pode verificar o status da sua reserva mais tarde ou tentar verificar novamente.');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      setStatus('error');
      setMessage('Erro ao verificar o status do pagamento. Tente novamente mais tarde.');
      setChecking(false);
      if (onError) onError('Erro de conexão ao verificar pagamento');
    }
  };

  // Verificar o status a cada 5 segundos
  useEffect(() => {
    if (!checking) return;
    
    checkPaymentStatus();
    
    const interval = setInterval(() => {
      if (checking) {
        checkPaymentStatus();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [checking, checkCount, pixId]);

  const handleVerificarManualmente = () => {
    setChecking(true);
    setCheckCount(0);
    checkPaymentStatus();
  };

  const handleVerReserva = () => {
    router.push('/reservas');
  };

  return (
    <div className="space-y-4 py-4">
      <Alert variant={status === 'approved' ? 'success' : status === 'error' ? 'destructive' : 'default'}>
        <AlertTitle>
          {status === 'approved' ? (
            <span className="flex items-center">
              <Check className="mr-2 h-4 w-4" /> Pagamento aprovado
            </span>
          ) : status === 'error' ? (
            'Problema na verificação'
          ) : (
            'Aguardando pagamento'
          )}
        </AlertTitle>
        <AlertDescription>
          {message}
        </AlertDescription>
      </Alert>

      {checking && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Verificando o status do pagamento...</span>
        </div>
      )}

      {!checking && status !== 'approved' && (
        <Button onClick={handleVerificarManualmente} variant="outline" className="w-full">
          Verificar novamente
        </Button>
      )}

      {status === 'approved' && (
        <Button onClick={handleVerReserva} className="w-full">
          Ver minhas reservas
        </Button>
      )}
    </div>
  );
}
