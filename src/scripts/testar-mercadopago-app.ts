// Script para testar a conexão do Mercado Pago usando o token da aplicação
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o Prisma Client
const prisma = new PrismaClient();

async function testarMercadoPagoApp() {
  console.log("🚀 Testando integração do Mercado Pago como marketplace");
  console.log("=====================================================\n");

  try {
    // 1. Verificar as variáveis de ambiente
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    const appId = process.env.MERCADO_PAGO_APP_ID;
    
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN não encontrado no .env");
    }
    
    console.log("✅ Dados do Mercado Pago encontrados no .env:");
    console.log(`   Access Token: ${accessToken.substring(0, 15)}...`);
    console.log(`   Public Key: ${publicKey}`);
    console.log(`   App ID: ${appId}\n`);

    // 2. Verificar o status da aplicação
    console.log("Verificando informações da aplicação no Mercado Pago...");
    const response = await fetch("https://api.mercadopago.com/users/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("❌ Erro ao consultar informações da aplicação:");
      console.log(JSON.stringify(data, null, 2));
      throw new Error(`Erro na API do Mercado Pago: ${data.message}`);
    }

    console.log("✅ Informações da aplicação obtidas com sucesso!");
    console.log("\n📋 Detalhes da aplicação:");
    console.log(`   ID da Aplicação: ${data.id}`);
    console.log(`   Nome: ${data.first_name} ${data.last_name}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Status da conta: ${data.status}`);
    
    // 3. Verificar permissões de marketplace
    if (data.permissions && data.permissions.length > 0) {
      console.log("\n🔐 Permissões disponíveis:");
      data.permissions.forEach((permission: string) => {
        console.log(`   - ${permission}`);
      });
      
      // Verificar se tem permissão de marketplace
      const hasMarketplace = data.permissions.some((p: string) => 
        p.includes("marketplace") || p.includes("split"));
      
      if (hasMarketplace) {
        console.log("\n✅ Aplicação habilitada como marketplace!");
      } else {
        console.log("\n⚠️ Aplicação NÃO tem permissão de marketplace.");
        console.log("   É necessário solicitar esta permissão no Portal de Desenvolvedores.");
      }
    }
    
    // 4. Buscar espaço conectado para testar um pagamento exemplo
    const espaco = await prisma.espaco.findFirst({
      where: {
        NOT: {
          mercadoPagoAccessToken: null
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        mercadoPagoAccessToken: true,
        mercadoPagoUserId: true
      }
    });

    if (espaco) {
      console.log("\n✅ Encontrado espaço conectado ao Mercado Pago:");
      console.log(`   Nome: ${espaco.nome}`);
      console.log(`   Email: ${espaco.email}`);
      console.log(`   ID no Mercado Pago: ${espaco.mercadoPagoUserId || "Não disponível"}`);
      
      // Se não tiver ID do usuário no MP, vamos tentar obter
      if (!espaco.mercadoPagoUserId && espaco.mercadoPagoAccessToken) {
        try {
          console.log("\nConsultando ID do vendedor no Mercado Pago...");
          const vendorResponse = await fetch("https://api.mercadopago.com/users/me", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${espaco.mercadoPagoAccessToken}`
            }
          });
          
          if (vendorResponse.ok) {
            const vendorData = await vendorResponse.json();
            console.log(`✅ ID do vendedor encontrado: ${vendorData.id}`);
            
            // Atualizar o ID do vendedor no banco
            await prisma.espaco.update({
              where: { id: espaco.id },
              data: { mercadoPagoUserId: vendorData.id }
            });
            
            console.log("✅ ID do vendedor atualizado no banco de dados");
          } else {
            console.log("⚠️ Não foi possível consultar informações do vendedor");
          }
        } catch (error: any) {
          console.log(`⚠️ Erro ao consultar vendedor: ${error.message}`);
        }
      }
      
      // Verificar se podemos criar um pagamento exemplo
      if (data.permissions && data.permissions.some((p: string) => p.includes("payment"))) {
        console.log("\n⚙️ Aplicação pode criar pagamentos. Você pode desenvolver a funcionalidade de split payments.");
      } else {
        console.log("\n⚠️ Aplicação não tem permissão para criar pagamentos.");
      }
    } else {
      console.log("\n⚠️ Nenhum espaço conectado ao Mercado Pago encontrado.");
      console.log("   É necessário que pelo menos um espaço se conecte usando OAuth.");
    }

    console.log("\n✨ Verificação concluída!");
    return { success: true, data };
  } catch (error: any) {
    console.error("\n❌ Erro durante a verificação:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testarMercadoPagoApp()
  .then(result => {
    if (result.success) {
      console.log("\n🎉 Teste concluído com sucesso!");
      process.exit(0);
    } else {
      console.error("\n😥 Teste falhou. Verifique os erros acima.");
      process.exit(1);
    }
  })
  .catch(error => {
    console.error("Erro inesperado:", error);
    process.exit(1);
  });
