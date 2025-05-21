// Script para testar o Split de Pagamentos do Mercado Pago
import { MercadoPagoConfig, Payment } from 'mercadopago';
import axios from 'axios';

async function testMercadoPagoSplit() {
  try {
    console.log('===== TESTE DE SPLIT DE PAGAMENTOS DO MERCADO PAGO =====');

    // Token de acesso principal da plataforma (seu token)
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-1623365362922759-031315-1f53874e1d4470720c3960d48257047b-1066285780';
    
    console.log(`Token de acesso: ${accessToken.substring(0, 10)}...${accessToken.substring(accessToken.length - 10)}`);

    // 1. Verificar identidade do usuário (plataforma)
    console.log('\n1. Verificando identidade do usuário...');
    try {
      const userResponse = await axios.get('https://api.mercadolibre.com/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log('✅ Identidade verificada:');
      console.log(`ID: ${userResponse.data.id}`);
      console.log(`Nome: ${userResponse.data.first_name}`);
      console.log(`Email: ${userResponse.data.email}`);
      console.log(`Tipo: ${userResponse.data.user_type}`);
      
      // Verificar se a conta tem permissões de marketplace
      console.log('\nVerificando permissões de marketplace:');
      if (userResponse.data.tags && userResponse.data.tags.includes('marketplace')) {
        console.log('✅ Conta configurada como marketplace');
      } else {
        console.log('⚠️ Conta NÃO está configurada como marketplace');
        console.log('Tags disponíveis:', userResponse.data.tags.join(', '));
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao verificar identidade:');
      console.error(error.response?.data || error.message);
      return { success: false, error: 'Falha na verificação de identidade' };
    }

    // 2. Verificar aplicação OAuth
    console.log('\n2. Verificando aplicação OAuth...');
    const clientId = process.env.MERCADO_PAGO_APP_ID || '1623365362922759';
    const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET || 'e8kfcgG1zirfvPDUBGTkrtQ44ixJRZfG';
    
    console.log(`Client ID: ${clientId}`);
    console.log(`Client Secret: ${clientSecret.substring(0, 3)}${'*'.repeat(10)}${clientSecret.substring(clientSecret.length - 3)}`);
    
    // Tentar obter token usando client credentials (isso não deve funcionar para aplicações marketplace)
    console.log('\nTentando obter token com client credentials (apenas teste):');
    try {
      const tokenResponse = await axios.post('https://api.mercadopago.com/oauth/token', 
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret
        }), 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('✅ Token obtido com client credentials:');
      console.log(`Access Token: ${tokenResponse.data.access_token.substring(0, 10)}...`);
      console.log(`Expires In: ${tokenResponse.data.expires_in} segundos`);
      
    } catch (error: any) {
      console.log('⚠️ Não foi possível obter token com client credentials:');
      console.log(error.response?.data || error.message);
      console.log('Isso é esperado para aplicações marketplace que usam apenas OAuth.');
    }
    
    // 3. Testar criação de um pagamento com split
    console.log('\n3. Simulando pagamento com split...');
    
    // Configuração do cliente MP
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    
    // Dados do pagamento de teste
    const paymentData = {
      transaction_amount: 100.0,
      description: 'Teste de pagamento com split',
      payment_method_id: 'pix',
      payer: {
        email: 'teste@exemplo.com'
      },
      // Configuração de marketplace - precisa de seller_id válido
      marketplace_fee: 10, // 10% de taxa da plataforma
      metadata: {
        test_mode: true,
        platform: 'dezko'
      }
    };
    
    console.log('Dados do pagamento:');
    console.log(JSON.stringify(paymentData, null, 2));
    
    console.log('\nPara criar um pagamento com split real, você precisaria:');
    console.log('1. Ter uma conta configurada como marketplace no Mercado Pago');
    console.log('2. Ter sellers (vendedores) autenticados através do OAuth');
    console.log('3. Usar o token de acesso do seller ou application_fee + marketplace_owner para a divisão');
    
    console.log('\nRecomendações para o Split de Pagamentos:');
    console.log('1. Verifique se sua aplicação está aprovada para marketplace');
    console.log('2. Confirme se todas as permissões necessárias estão configuradas');
    console.log('3. Certifique-se de que os vendedores estão autenticados via OAuth');
    console.log('4. Consulte a documentação específica: https://www.mercadopago.com.br/developers/pt/docs/split-payments');
    
    return {
      success: true,
      message: 'Teste de verificação do Split de Pagamentos concluído'
    };
    
  } catch (error) {
    console.error('Erro durante o teste de Split de Pagamentos:');
    console.error(error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Executar o teste
testMercadoPagoSplit().then(result => {
  console.log('\nResultado final do teste:', result.success ? 'SUCESSO' : 'FALHA');
  if (!result.success) {
    console.error('Erro:', result.error);
    process.exit(1);
  } else {
    console.log('\n✅ Script de teste concluído');
    process.exit(0);
  }
});
