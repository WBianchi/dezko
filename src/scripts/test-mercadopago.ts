// Script de teste para verificar a integração com o Mercado Pago
import { MercadoPagoConfig, Payment } from 'mercadopago';

async function testMercadoPago() {
  try {
    console.log('Iniciando teste de integração com Mercado Pago...');
    
    // Utiliza as credenciais do arquivo .env através do env.ts
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-1250867385179214-021716-471b79f7cbd0a94478ac9f7d2adad912-1066285780';
    
    console.log('Configurando cliente com token:', accessToken.substring(0, 10) + '...');
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    
    // Testar criação de um pagamento PIX
    const paymentData = {
      transaction_amount: 10.0,
      description: 'Teste de integração PIX',
      payment_method_id: 'pix',
      payer: {
        email: 'teste@exemplo.com',
        first_name: 'Usuário',
        last_name: 'Teste',
      }
    };
    
    console.log('Tentando criar pagamento PIX com os seguintes dados:', 
      JSON.stringify(paymentData, null, 2));
    
    const result = await payment.create({ body: paymentData });
    
    console.log('Resposta do Mercado Pago:');
    console.log('Status:', result.status);
    console.log('ID do Pagamento:', result.id);
    
    // Verificar se o QR Code foi gerado
    const pixData = result.point_of_interaction?.transaction_data;
    
    if (pixData) {
      console.log('QR Code gerado com sucesso!');
      console.log('QR Code URL:', pixData.qr_code);
      console.log('QR Code Base64 (primeiros 50 caracteres):', 
        pixData.qr_code_base64 ? pixData.qr_code_base64.substring(0, 50) + '...' : 'N/A');
      console.log('Data de expiração:', pixData.expiration_date);
      
      return {
        success: true,
        data: {
          qr_code: pixData.qr_code,
          qr_code_base64: pixData.qr_code_base64,
          expiration_date: pixData.expiration_date
        }
      };
    } else {
      console.error('QR Code não foi gerado na resposta:');
      console.error(JSON.stringify(result, null, 2));
      return { success: false, error: 'QR Code não foi gerado' };
    }
    
  } catch (error) {
    console.error('Erro durante o teste de integração com Mercado Pago:');
    console.error(error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Executar o teste
console.log('==== TESTE DE INTEGRAÇÃO COM MERCADO PAGO ====');
testMercadoPago().then(result => {
  console.log('\nResultado do teste:', result.success ? 'SUCESSO' : 'FALHA');
  if (!result.success) {
    console.error('Erro:', result.error);
    process.exit(1);
  } else {
    process.exit(0);
  }
});
