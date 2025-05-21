import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';
import { isOpenPixConfigured, testOpenPixConnection, createPixCharge } from '@/lib/openpix';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(auth);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o OpenPix está configurado
    const isConfigured = isOpenPixConfigured();
    
    // Mostrar configuração atual
    const configInfo = {
      isConfigured,
      authKeyExists: !!process.env.OPENPIX_AUTH_KEY,
      authKeyPrefix: process.env.OPENPIX_AUTH_KEY ? process.env.OPENPIX_AUTH_KEY.substring(0, 10) + '...' : null,
      webhookSecretExists: !!process.env.OPENPIX_WEBHOOK_SECRET,
      nodeEnv: process.env.NODE_ENV,
    };

    console.log('Configuração atual OpenPix:', configInfo);
    
    // Se não estiver configurado, retornar apenas as informações de configuração
    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        message: 'OpenPix não está configurado. Configure OPENPIX_AUTH_KEY no .env',
        config: configInfo,
      });
    }
    
    // Parte 1: Testar a conexão com a API
    const connectionTest = await testOpenPixConnection();
    
    // Parte 2: Tentar criar uma cobrança de teste
    let chargeResult = null;
    let chargeError = null;
    
    if (connectionTest.success) {
      try {
        // Criar um payload de teste
        const testPayload = {
          correlationID: `teste-${Date.now()}`,
          value: 100, // R$ 1,00 em centavos
          comment: 'Teste de integração OpenPix',
          expiresIn: 3600, // 1 hora
          customer: {
            name: 'Usuário Teste',
            email: 'teste@exemplo.com',
            phone: '11999999999',
          }
        };
        
        console.log('Tentando criar cobrança de teste:', testPayload);
        const charge = await createPixCharge(testPayload);
        chargeResult = charge;
      } catch (error: any) {
        console.error('Erro ao criar cobrança de teste:', error);
        chargeError = {
          message: error.message,
          stack: error.stack,
        };
      }
    }

    return NextResponse.json({
      success: connectionTest.success && !chargeError,
      config: configInfo,
      connectionTest: connectionTest,
      chargeTest: {
        success: !!chargeResult && !chargeError,
        result: chargeResult,
        error: chargeError,
      },
    });
  } catch (error: any) {
    console.error('Erro no teste OpenPix:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
