// Script para testar pagamento com dados completos do pagador
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o Prisma Client
const prisma = new PrismaClient();

// Função para gerar um ID aleatório para o pagamento
function gerarIdPagamento(): string {
  return `dezko_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

async function testarPagamentoCompleto() {
  console.log("🚀 Testando pagamento com dados completos no Mercado Pago");
  console.log("=============================================\n");

  try {
    // 1. Obter o token de acesso da aplicação
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN não encontrado no .env");
    }
    
    console.log(`✅ Access Token encontrado: ${accessToken.substring(0, 15)}...\n`);

    // 2. Buscar um espaço para usar como vendedor
    console.log("Buscando espaço conectado ao Mercado Pago...");
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
        mercadoPagoUserId: true,
        mercadoPagoAccessToken: true
      }
    });

    if (!espaco) {
      throw new Error("Nenhum espaço com token do Mercado Pago encontrado");
    }

    console.log(`✅ Espaço encontrado: ${espaco.nome} (ID: ${espaco.id})`);
    console.log(`   Email: ${espaco.email}`);
    console.log(`   ID no Mercado Pago: ${espaco.mercadoPagoUserId || "Não identificado"}\n`);

    // 3. Verificar se a conta do vendedor está em modo de produção
    try {
      console.log("Verificando status da conta do vendedor...");
      const userResponse = await fetch("https://api.mercadopago.com/users/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${espaco.mercadoPagoAccessToken}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log(`✅ Informações da conta do vendedor recuperadas`);
        console.log(`   Nome: ${userData.first_name} ${userData.last_name}`);
        console.log(`   Status: ${userData.status?.site_status || "N/A"}`);
        console.log(`   Tipo de conta: ${userData.account_type || "N/A"}\n`);
      } else {
        console.log("⚠️ Não foi possível verificar a conta do vendedor\n");
      }
    } catch (error) {
      console.log("⚠️ Erro ao verificar conta do vendedor\n");
    }

    // 4. Criar um pagamento simples usando a API direta com dados completos
    console.log("Criando pagamento de teste com dados completos...");
    
    // Gerando referência externa única
    const externalReference = gerarIdPagamento();
    console.log(`Referência externa: ${externalReference}`);
    
    // Valores para o pagamento
    const valorTotal = 5.00;  // R$ 5,00 - valor mínimo

    // Dados completos do pagador (obrigatórios em produção)
    const dadosPagador = {
      email: "test_user_123456@testuser.com",
      first_name: "Test",
      last_name: "User",
      identification: {
        type: "CPF",
        number: "12345678909"  // CPF de teste
      },
      address: {
        zip_code: "01310-200",
        street_name: "Av. Paulista",
        street_number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        federal_unit: "SP"
      }
    };
    
    // Abordagem 1: Usando a API de Pagamentos com PIX e dados completos
    console.log("\nTentando criar pagamento PIX com dados completos...");
    
    const payloadPix = {
      transaction_amount: valorTotal,
      description: "Teste de Pagamento Completo - PIX",
      payment_method_id: "pix",
      payer: dadosPagador,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br"}/api/mercadopago/webhook`,
    };
    
    const pixResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-Idempotency-Key": `${externalReference}_pix`
      },
      body: JSON.stringify(payloadPix)
    });
    
    const pixData = await pixResponse.json();
    
    if (!pixResponse.ok) {
      console.log("⚠️ Erro ao criar pagamento PIX:");
      console.log(JSON.stringify(pixData, null, 2));
      console.log("Tentando outra abordagem...\n");
    } else {
      console.log("✅ Pagamento PIX criado com sucesso!");
      console.log("ID do pagamento:", pixData.id);
      console.log("Status:", pixData.status);
      
      if (pixData.point_of_interaction && pixData.point_of_interaction.transaction_data) {
        console.log("\n📱 Dados para pagamento PIX:");
        console.log(`QR Code: ${pixData.point_of_interaction.transaction_data.qr_code_base64}`);
        console.log(`Código PIX: ${pixData.point_of_interaction.transaction_data.qr_code}`);
        
        // Salvar QR code em um arquivo para facilitar o teste
        try {
          const fs = await import('fs');
          const path = await import('path');
          const qrCodePath = path.default.resolve(process.cwd(), 'qrcode.txt');
          fs.default.writeFileSync(qrCodePath, pixData.point_of_interaction.transaction_data.qr_code);
          console.log(`\n✅ Código PIX salvo em: ${qrCodePath}`);
        } catch (error) {
          console.log("⚠️ Não foi possível salvar o código PIX em arquivo");
        }
      }
      
      return { success: true, data: pixData };
    }
    
    // Abordagem 2: Usando a API de Preferência para gerar um checkout com dados completos
    console.log("\nTentando criar preferência de checkout com dados completos...");
    
    const payloadPreferencia = {
      items: [
        {
          id: "item-teste-5reais",
          title: "Teste Completo Mercado Pago",
          description: "Teste de integração com dados completos - 5 Reais",
          category_id: "services",
          quantity: 1,
          unit_price: valorTotal,
          currency_id: "BRL"
        }
      ],
      payer: dadosPagador,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br"}/api/mercadopago/webhook`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br"}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br"}/pagamento/falha`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br"}/pagamento/pendente`
      },
      external_reference: externalReference,
      auto_return: "approved"
    };
    
    const preferenciaResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(payloadPreferencia)
    });
    
    const preferenciaData = await preferenciaResponse.json();
    
    if (!preferenciaResponse.ok) {
      console.log("⚠️ Erro ao criar preferência:");
      console.log(JSON.stringify(preferenciaData, null, 2));
      console.log("Tentando último método...\n");
    } else {
      console.log("✅ Preferência criada com sucesso!");
      console.log("ID da preferência:", preferenciaData.id);
      console.log("\nLinks de pagamento:");
      console.log(`- Sandbox: ${preferenciaData.sandbox_init_point}`);
      console.log(`- Produção: ${preferenciaData.init_point}`);
      
      return { success: true, data: preferenciaData };
    }
    
    // Abordagem 3: Tentativa de pagamento com Split usando dados completos
    console.log("\nTentando criar pagamento Split com dados completos...");
    
    const payloadSplit = {
      transaction_amount: valorTotal,
      description: "Teste de Pagamento Split com dados completos",
      payment_method_id: "pix",
      payer: dadosPagador,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br"}/api/mercadopago/webhook`,
      // Adicionar informações de split
      application_fee: valorTotal * 0.1, // 10% de taxa
      collector_id: espaco.mercadoPagoUserId,
    };
    
    // Se o espaço tem um ID do Mercado Pago, usamos para split
    if (espaco.mercadoPagoUserId) {
      const splitResponse = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "X-Idempotency-Key": `${externalReference}_split`
        },
        body: JSON.stringify(payloadSplit)
      });
      
      const splitData = await splitResponse.json();
      
      if (!splitResponse.ok) {
        console.log("⚠️ Erro ao criar pagamento Split:");
        console.log(JSON.stringify(splitData, null, 2));
      } else {
        console.log("✅ Pagamento Split criado com sucesso!");
        console.log("ID do pagamento:", splitData.id);
        console.log("Status:", splitData.status);
        
        if (splitData.point_of_interaction && splitData.point_of_interaction.transaction_data) {
          console.log("\n📱 Dados para pagamento PIX (Split):");
          console.log(`QR Code: ${splitData.point_of_interaction.transaction_data.qr_code_base64}`);
          console.log(`Código PIX: ${splitData.point_of_interaction.transaction_data.qr_code}`);
        }
        
        return { success: true, data: splitData };
      }
    }
    
    throw new Error("Todos os métodos de pagamento falharam");
  } catch (error: any) {
    console.error("\n❌ Erro durante o teste:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testarPagamentoCompleto()
  .then(result => {
    if (result.success) {
      console.log("\n🎉 Teste de pagamento concluído com sucesso!");
      console.log("\n⚠️ IMPORTANTE: Para testar o pagamento completo, acesse um dos links acima");
      console.log("   ou use o código PIX gerado. Este é um pagamento de TESTE e uma cobrança real será feita,");
      console.log("   mas você pode cancelá-la posteriormente no painel do Mercado Pago.");
    } else {
      console.log("\n❌ Teste de pagamento falhou.");
    }
  })
  .catch(error => {
    console.error("\n❌ Erro inesperado:", error);
  });
