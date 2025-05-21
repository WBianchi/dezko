import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { isOpenPixConfigured, getCharge } from '@/lib/openpix';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'ID da cobrança é necessário' },
      { status: 400 }
    );
  }

  try {
    // Verificar se o OpenPix está configurado
    if (!isOpenPixConfigured()) {
      return NextResponse.json(
        { error: 'OpenPix não está configurado corretamente' },
        { status: 500 }
      );
    }
    
    // Verificar o status da cobrança no OpenPix usando o SDK
    let chargeData;
    try {
      chargeData = await getCharge(id);
      console.log('Dados da cobrança recuperados:', JSON.stringify(chargeData, null, 2));
    } catch (error: any) {
      console.error('Erro ao verificar status do PIX:', error);
      return NextResponse.json(
        { error: 'Erro ao verificar status do PIX', details: error.message },
        { status: 500 }
      );
    }

    // Buscar o pedido associado usando SQL raw para evitar problemas de tipagem
    const pedidos = await prisma.$queryRaw`SELECT * FROM "Pedido" WHERE "openPixChargeId" = ${id} LIMIT 1`;
    const pedido = pedidos && Array.isArray(pedidos) && pedidos.length > 0 ? pedidos[0] : null;

    if (pedido) {
      // Se o pedido foi encontrado e o pagamento foi concluído
      if (chargeData.status === 'COMPLETED' || chargeData.status === 'CONFIRMED') {
        await prisma.pedido.update({
          where: { id: pedido.id },
          data: {
            statusPedido: 'PAGO',
          },
        });

        return NextResponse.json({
          status: 'approved',
          message: 'Pagamento aprovado e pedido atualizado',
        });
      }
      
      // Mapeamento de status do OpenPix para nosso sistema
      const statusMapping = {
        'ACTIVE': 'pending',
        'COMPLETED': 'approved',
        'EXPIRED': 'cancelled',
        'CONFIRMED': 'approved',
        'FAILED': 'rejected',
        'RECEIVED': 'approved',  // Importante: adicionar mais estados que indicam pagamento recebido
        'PAID': 'approved'
      };
      
      // Extrair o status conforme a estrutura da resposta
      // A API da OpenPix pode retornar o status em diferentes posições
      const pixStatus = chargeData.status || 
        chargeData.charge?.status || 
        chargeData.pix?.status ||
        'ACTIVE';
        
      console.log('Status extraído da API OpenPix:', pixStatus);
      
      // Mapear o status da OpenPix para nosso formato interno
      // @ts-ignore
      const mappedStatus = statusMapping[pixStatus] || 'pending';
      
      console.log('Status mapeado para:', mappedStatus);

      return NextResponse.json({
        status: mappedStatus,
        openPixStatus: pixStatus,
        message: 'Status da cobrança verificado',
        debugInfo: { originalResponse: chargeData }  // Incluir resposta original para debug
      });
    } else {
      // Pedido não encontrado, apenas retorna o status da cobrança
      return NextResponse.json({
        status: 'pending',
        openPixStatus: chargeData.status,
        message: 'Pedido não encontrado para esta cobrança',
      });
    }
  } catch (error: any) {
    console.error('Erro ao processar verificação de pagamento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
