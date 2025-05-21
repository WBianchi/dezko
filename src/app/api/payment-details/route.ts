import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import fetch from 'node-fetch';

// A chave de autorização do OpenPix
const OPENPIX_AUTH_KEY = process.env.OPENPIX_AUTH_KEY || 'Q2xpZW50X0lkX2JhZmUxODFkLTU3MjItNDM5OC1hZDQ4LWI5NGJhMjQxYTZmOTpDbGllbnRfU2VjcmV0X3hqVUpXdHdYNllMRWgvcVU1SE5uT292Z29jY3FzNXNoZUMyaGVRNVNJZGM9';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(auth);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID da cobrança é necessário' },
        { status: 400 }
      );
    }

    // Verificar se a cobrança existe na OpenPix
    const response = await fetch(`https://api.openpix.com.br/api/v1/charge/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': OPENPIX_AUTH_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao buscar cobrança OpenPix:', errorData);
      
      return NextResponse.json(
        { error: 'Cobrança não encontrada', details: errorData },
        { status: 404 }
      );
    }

    const chargeData = await response.json();
    
    // Converter dados da API para o formato esperado pelo frontend
    const pixData = {
      qrCodeImage: chargeData.charge.qrCodeImage,
      qrCodeText: chargeData.charge.brCode,
      pixCopiaECola: chargeData.charge.brCode,
      expirationDate: chargeData.charge.expiresAt,
      chargeId: chargeData.charge.id,
    };

    // Determinar o status baseado no status da cobrança
    let status: 'pending' | 'approved' | 'rejected' | 'cancelled' = 'pending';
    
    switch (chargeData.charge.status) {
      case 'ACTIVE':
      case 'CREATED':
        status = 'pending';
        break;
      case 'COMPLETED':
      case 'CONFIRMED':
        status = 'approved';
        break;
      case 'EXPIRED':
        status = 'cancelled';
        break;
      case 'ERROR':
      case 'FAILED':
        status = 'rejected';
        break;
      default:
        status = 'pending';
    }

    return NextResponse.json({
      success: true,
      pixData,
      status,
    });
  } catch (error: any) {
    console.error('Erro ao processar detalhes do pagamento PIX:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
