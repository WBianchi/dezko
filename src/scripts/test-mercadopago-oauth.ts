// Script para testar a configuração do OAuth do Mercado Pago
import axios from 'axios';

async function testMercadoPagoOAuth() {
  try {
    console.log('===== TESTE DE CONFIGURAÇÃO OAUTH DO MERCADO PAGO =====');

    // Usar o client_id do ambiente
    const clientId = process.env.MERCADO_PAGO_APP_ID || '6587762469152592';
    const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET || 'Ilk6xNfZbhIWIy5qakNhXT2iQLDFpUjd';
    
    console.log(`Client ID: ${clientId}`);
    console.log(`Client Secret: ${clientSecret.substring(0, 3)}${'*'.repeat(clientSecret.length - 6)}${clientSecret.substring(clientSecret.length - 3)}`);

    // Verificar o status da aplicação
    console.log('\n1. Verificando status da aplicação...');
    
    // URL para obter info da aplicação
    const appInfoUrl = `https://api.mercadopago.com/oauth/applications/${clientId}`;
    
    try {
      const response = await axios.get(appInfoUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientSecret}`
        }
      });
      
      console.log('\nInformações da aplicação:');
      console.log(JSON.stringify(response.data, null, 2));
      
      const appName = response.data.name || 'Nome não encontrado';
      const appStatus = response.data.status || 'Status não encontrado';
      const redirectUrls = response.data.redirect_urls || [];
      
      console.log(`\nNome da aplicação: ${appName}`);
      console.log(`Status da aplicação: ${appStatus}`);
      console.log(`URLs de redirecionamento configuradas: ${redirectUrls.join(', ') || 'Nenhuma'}`);
      
      console.log('\nVerificando se as URLs de redirecionamento contêm "dezko.com.br/api/mercadopago/oauth"...');
      const hasValidRedirectUrl = redirectUrls.some(url => 
        url.includes('dezko.com.br/api/mercadopago/oauth'));
      
      if (hasValidRedirectUrl) {
        console.log('✅ URL de redirecionamento correta encontrada');
      } else {
        console.log('❌ URL de redirecionamento não encontrada. Adicione "https://dezko.com.br/api/mercadopago/oauth" nas URLs de redirecionamento');
      }
      
      if (appStatus !== 'active') {
        console.log('❌ Aplicação não está ativa. Certifique-se de que a aplicação esteja em produção.');
      } else {
        console.log('✅ Aplicação está ativa');
      }
      
      return {
        success: true,
        data: {
          name: appName,
          status: appStatus,
          redirectUrls,
          hasValidRedirectUrl
        }
      };
    } catch (error: any) {
      console.error('\nErro ao obter informações da aplicação:');
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Mensagem: ${JSON.stringify(error.response.data)}`);
        
        if (error.response.status === 401) {
          console.log('\n❌ Erro de autenticação. Verifique se o Client Secret está correto.');
        } else if (error.response.status === 404) {
          console.log('\n❌ Aplicação não encontrada. Verifique se o Client ID está correto.');
        }
      } else {
        console.error(error.message);
      }
      
      // Teste alternativo com a URL de autorização
      console.log('\n2. Testando URL de autorização...');
      
      const baseUrl = 'https://auth.mercadopago.com.br/authorization';
      const redirectUri = 'https://dezko.com.br/api/mercadopago/oauth';
      
      const authUrl = `${baseUrl}?client_id=${clientId}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      console.log(`\nURL de autorização: ${authUrl}`);
      console.log('\nTentando acessar URL de autorização...');
      
      try {
        const authResponse = await axios.get(authUrl, { 
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400
        });
        
        console.log(`\nStatus da resposta: ${authResponse.status}`);
        console.log('✅ URL de autorização parece estar correta');
      } catch (authError: any) {
        console.error('\nErro ao acessar URL de autorização:');
        if (authError.response) {
          console.error(`Status: ${authError.response.status}`);
          if (authError.response.data && typeof authError.response.data === 'string' && 
              authError.response.data.includes('aplicativo não está pronto')) {
            console.log('\n❌ O aplicativo não está pronto para se conectar ao Mercado Pago.');
            console.log('Verifique se:');
            console.log('1. A aplicação está em modo de produção');
            console.log('2. Todos os campos obrigatórios estão preenchidos');
            console.log('3. As URLs de redirecionamento estão configuradas corretamente');
          }
        } else {
          console.error(authError.message);
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  } catch (error) {
    console.error('Erro durante o teste de OAuth do Mercado Pago:');
    console.error(error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Executar o teste
testMercadoPagoOAuth().then(result => {
  console.log('\nResultado final do teste:', result.success ? 'SUCESSO' : 'FALHA');
  if (!result.success) {
    console.error('Erro:', result.error);
    process.exit(1);
  } else {
    console.log('\n✅ Script de teste concluído');
    process.exit(0);
  }
});
