// Script para verificar e configurar permissões do Mercado Pago
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

async function configurarMercadoPagoPermissoes() {
  console.log("🚀 Verificando e configurando permissões do Mercado Pago");
  console.log("====================================================\n");

  try {
    // 1. Verificar tokens no .env
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const appId = process.env.MERCADO_PAGO_APP_ID;
    const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET;
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    
    if (!accessToken || !appId || !clientSecret) {
      throw new Error("Variáveis de ambiente do Mercado Pago não encontradas no .env");
    }
    
    console.log(`✅ Configurações do Mercado Pago encontradas`);
    console.log(`   App ID: ${appId}`);
    console.log(`   Access Token: ${accessToken.substring(0, 15)}...`);
    console.log(`   Public Key: ${publicKey}\n`);

    // 2. Verificar informações da conta
    console.log("Verificando informações da conta no Mercado Pago...");
    const userResponse = await fetch("https://api.mercadopago.com/users/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    
    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.log("❌ Erro ao consultar informações da conta:");
      console.log(JSON.stringify(errorData, null, 2));
      throw new Error(`Erro na API do Mercado Pago: ${errorData.message}`);
    }
    
    const userData = await userResponse.json();
    console.log("✅ Informações da conta obtidas com sucesso!");
    console.log(`   ID: ${userData.id}`);
    console.log(`   Nome: ${userData.first_name} ${userData.last_name}`);
    console.log(`   Email: ${userData.email}`);
    
    if (userData.status) {
      console.log(`   Status da conta: ${JSON.stringify(userData.status)}`);
    }
    
    // 3. Verificar permissões da aplicação
    console.log("\nVerificando permissões da aplicação...");
    
    const appResponse = await fetch(`https://api.mercadopago.com/applications/${appId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    
    let appData;
    
    if (!appResponse.ok) {
      console.log("⚠️ Não foi possível obter informações da aplicação. Isso pode ser normal se você não tiver acesso a essa API.");
    } else {
      appData = await appResponse.json();
      console.log("✅ Informações da aplicação obtidas com sucesso!");
      console.log(`   Nome: ${appData.name}`);
      console.log(`   Descrição: ${appData.description}`);
      
      if (appData.scopes) {
        console.log(`   Permissões: ${appData.scopes.join(", ")}`);
      }
    }
    
    // 4. Verificar credenciais de produção
    console.log("\nVerificando credenciais de produção...");
    
    const credentialsResponse = await fetch("https://api.mercadopago.com/credentials", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    
    if (!credentialsResponse.ok) {
      console.log("⚠️ Não foi possível verificar credenciais de produção");
    } else {
      const credentialsData = await credentialsResponse.json();
      
      if (credentialsData.some(cred => cred.mode === "production")) {
        console.log("✅ Conta possui credenciais de produção");
      } else {
        console.log("⚠️ Conta não possui credenciais de produção. Isso pode afetar a capacidade de realizar pagamentos reais.");
      }
    }
    
    // 5. Verificar webhooks configurados
    console.log("\nVerificando configuração de webhooks...");
    
    const webhooksResponse = await fetch("https://api.mercadopago.com/v1/payment_methods/webhooks", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    
    if (!webhooksResponse.ok) {
      console.log("⚠️ Não foi possível verificar webhooks configurados. Isso pode ser normal se a API não estiver disponível para sua conta.");
    } else {
      const webhooksData = await webhooksResponse.json();
      console.log("✅ Informações de webhooks obtidas com sucesso!");
      
      if (webhooksData.length === 0) {
        console.log("⚠️ Nenhum webhook configurado. Isso pode afetar a recepção de notificações de pagamento.");
      } else {
        console.log(`   Webhooks configurados: ${webhooksData.length}`);
        webhooksData.forEach((webhook, index) => {
          console.log(`   ${index + 1}. ${webhook.url} (${webhook.status})`);
        });
      }
    }
    
    // 6. Gerar URL de OAuth para obter permissões adicionais
    console.log("\n📋 Gerando URLs para configuração e obtenção de permissões...");
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br";
    const redirectUri = `${baseUrl}/api/mercadopago/oauth/callback`;
    
    const oauthUrl = `https://auth.mercadopago.com.br/authorization?client_id=${appId}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log("\n🔐 URL para autenticação OAuth e obtenção de permissões adicionais:");
    console.log(oauthUrl);
    
    // Criar um arquivo com as instruções
    const instructionsPath = path.resolve(process.cwd(), 'mercadopago-instrucoes.txt');
    const instructions = `# Instruções para configuração do Mercado Pago
    
## 1. Configuração no painel do Mercado Pago

Acesse https://www.mercadopago.com.br/developers/panel/app/${appId} e configure:

- Domínios permitidos: adicione seu domínio de produção (dezko.com.br)
- URL de retorno: ${redirectUri}
- Permissões: certifique-se de que a aplicação tem permissões para:
  * read
  * write
  * payments
  * offline_access (para refresh tokens)

## 2. Configuração do webhook para notificações

Configure um webhook no painel do Mercado Pago para receber notificações:
https://www.mercadopago.com.br/developers/panel/notifications

URL do webhook: ${baseUrl}/api/mercadopago/webhook

## 3. Verificação da conta

Certifique-se de que sua conta do Mercado Pago está com:
- Status "ativo" para recebimento de pagamentos
- Documentação completa para evitar restrições
- Dados bancários configurados

## 4. Link para autorização e obtenção de permissões adicionais

${oauthUrl}

## 5. Sobre o erro "PolicyAgent"

O erro "PolicyAgent" com código PA_UNAUTHORIZED_RESULT_FROM_POLICIES acontece quando o Mercado Pago bloqueia uma operação por questões de segurança.

Possíveis causas:
- Conta não completamente verificada
- IP ou domínio não permitido
- Permissões insuficientes
- Conta nova em análise
- Inconsistência entre ambiente de produção e teste

## 6. Próximos passos

1. Verifique as notificações no painel do Mercado Pago
2. Entre em contato com o suporte do Mercado Pago caso o problema persista
3. Verifique se os dados de pagamento estão corretos
4. Certifique-se de que o servidor de produção tem o mesmo token que o ambiente local
`;
    
    fs.writeFileSync(instructionsPath, instructions);
    console.log(`\n✅ Instruções salvas em: ${instructionsPath}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("\n❌ Erro durante a verificação:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  }
}

// Executar o script
configurarMercadoPagoPermissoes()
  .then(result => {
    if (result.success) {
      console.log("\n🎉 Verificação concluída com sucesso!");
      console.log("\n⚠️ IMPORTANTE: Leia o arquivo mercadopago-instrucoes.txt para configurar corretamente o Mercado Pago.");
      process.exit(0);
    } else {
      console.error("\n😥 Verificação falhou. Verifique os erros acima.");
      process.exit(1);
    }
  })
  .catch(error => {
    console.error("Erro inesperado:", error);
    process.exit(1);
  });
