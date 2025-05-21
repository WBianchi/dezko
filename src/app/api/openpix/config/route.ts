import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(auth);
    
    // Verificar se há uma sessão válida
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário tem papel de admin
    const userRole = session && typeof session === 'object' && 'user' in session 
      ? (session.user && typeof session.user === 'object' && 'role' in session.user 
          ? session.user.role 
          : null) 
      : null;
      
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Obter dados de configuração
    const config = {
      openpixAuthKey: process.env.OPENPIX_AUTH_KEY 
        ? `${process.env.OPENPIX_AUTH_KEY.substring(0, 10)}...` 
        : 'Não configurado',
      openpixWebhookSecret: process.env.OPENPIX_WEBHOOK_SECRET 
        ? 'Configurado' 
        : 'Não configurado',
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Não configurado',
      nodeEnv: process.env.NODE_ENV || 'Não configurado'
    };

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error: any) {
    console.error('Erro ao verificar configuração:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
