import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Você deverá configurar esta chave no painel do OpenPix
const WEBHOOK_SECRET = process.env.OPENPIX_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    // Verificar se temos um webhook secret configurado
    if (!WEBHOOK_SECRET) {
      console.warn('OpenPix webhook secret não configurado');
    }

    // Obter a assinatura do header
    const signature = req.headers.get('x-webhook-signature') || '';
    
    // Obter o corpo da requisição como texto
    const body = await req.text();
    
    // Se temos um segredo configurado, verificar a assinatura
    if (WEBHOOK_SECRET) {
      const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
      const calculatedSignature = hmac.update(body).digest('hex');
      
      if (calculatedSignature !== signature) {
        console.error('Assinatura do webhook inválida');
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
      }
    }
    
    // Converter o corpo para JSON
    const webhookData = JSON.parse(body);
    
    // Verificar o tipo de evento
    const event = webhookData.event;
    const pixData = webhookData.charge;
    
    if (!event || !pixData) {
      return NextResponse.json({ error: 'Dados do webhook incompletos' }, { status: 400 });
    }

    console.log(`Webhook OpenPix recebido: ${event}`, pixData);
    
    // Se for um evento de cobrança paga (CHARGE_CREATED, CHARGE_COMPLETE, etc)
    if (event === 'CHARGE_COMPLETED' || event === 'CHARGE_RECEIVED') {
      // Extrair o ID do pedido do correlationID
      const pedidoId = pixData.correlationID.replace('pedido-', '');
      
      // Encontrar o pedido pelo ID
      const pedido = await prisma.pedido.findFirst({
        where: { id: pedidoId },
      });
      
      if (pedido) {
        // Atualizar o status do pedido para pago
        await prisma.pedido.update({
          where: { id: pedido.id },
          data: {
            statusPedido: 'PAGO',
            // Você pode adicionar mais campos para registrar outras informações
          },
        });
        
        console.log(`Pedido ${pedido.id} atualizado para PAGO via webhook do OpenPix`);
      } else {
        console.warn(`Nenhum pedido encontrado para a cobrança ${pixData.correlationID}`);
      }
    }
    
    // Responder com sucesso
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erro ao processar webhook do OpenPix:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
