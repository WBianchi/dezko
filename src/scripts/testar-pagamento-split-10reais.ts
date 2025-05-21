// Script para testar pagamento com split usando o token da aplicação
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

async function testarPagamentoSplit() {
  console.log("🚀 Testando pagamento com split no Mercado Pago");
  console.log("==============================================\n");

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
        mercadoPagoUserId: true
      }
    });

    if (!espaco) {
      throw new Error("Nenhum espaço com token do Mercado Pago encontrado");
    }

    console.log(`✅ Espaço encontrado: ${espaco.nome} (ID: ${espaco.id})`);
    console.log(`   Email: ${espaco.email}`);
    console.log(`   ID no Mercado Pago: ${espaco.mercadoPagoUserId || "Não identificado"}\n`);

    // 3. Verificar o ID do vendedor no Mercado Pago
    let vendedorId = espaco.mercadoPagoUserId;
    
    if (!vendedorId) {
      console.log("⚠️ ID do vendedor não encontrado. Usando ID padrão para teste.");
      vendedorId = "358636487"; // ID do vendedor no Mercado Pago (substituir pelo real)
    }

    // 4. Criar um pagamento com split usando a API do Marketplace
    console.log("Criando pagamento de teste com split...");
    
    // Gerando referência externa única
    const externalReference = gerarIdPagamento();
    console.log(`Referência externa: ${externalReference}`);
    
    // Valores para o pagamento
    const valorTotal = 10.00;  // R$ 10,00
    const taxaAplicacao = 1.00; // R$ 1,00 (10%)
    const valorVendedor = valorTotal - taxaAplicacao; // R$ 9,00 (90%)

    // Payload para criação de preferência com split
    // Esta é a abordagem de Marketplace usando a API de preferências
    const payloadPreferencia = {
      external_reference: externalReference,
      items: [
        {
          id: "item-teste-10reais",
          title: "Reserva de Espaço (TESTE 10 REAIS)",
          description: "Teste de integração de Split Payments - 10 Reais",
          category_id: "services",
          quantity: 1,
          unit_price: valorTotal,
          currency_id: "BRL"
        }
      ],
      marketplace_fee: taxaAplicacao, // Taxa da aplicação (Dezko)
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br"}/api/mercadopago/webhook`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br"}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br"}/pagamento/falha`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || "https://dezko.com.br"}/pagamento/pendente`
      },
      auto_return: "approved"
    };

    console.log("Payload da preferência:", JSON.stringify(payloadPreferencia, null, 2));
    
    // Criando a preferência usando o token do aplicativo
    console.log("\nEnviando requisição para criação de preferência...");
    
    // Método 1: Usando API de Preferências
    try {
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
        console.log("Tentando método alternativo...\n");
      } else {
        console.log("✅ Preferência criada com sucesso!");
        console.log("ID da preferência:", preferenciaData.id);
        console.log("\nLinks de pagamento:");
        console.log(`- Sandbox: ${preferenciaData.sandbox_init_point}`);
        console.log(`- Produção: ${preferenciaData.init_point}`);
        
        console.log("\n✅ Detalhes da divisão do pagamento:");
        console.log(`- Valor total: R$ ${valorTotal.toFixed(2)}`);
        console.log(`- Taxa da aplicação (Dezko): R$ ${taxaAplicacao.toFixed(2)} (${(taxaAplicacao / valorTotal * 100).toFixed(2)}%)`);
        console.log(`- Valor para o vendedor: R$ ${valorVendedor.toFixed(2)} (${(valorVendedor / valorTotal * 100).toFixed(2)}%)`);
        
        return { success: true, data: preferenciaData };
      }
    } catch (error: any) {
      console.log(`⚠️ Erro ao usar API de preferências: ${error.message}`);
      console.log("Tentando método alternativo...\n");
    }
    
    // Método 2: Usando API de Payments com split explícito
    console.log("Tentando método alternativo de Split Payment...");
    
    // Payload para pagamento direto com split
    const payloadPagamento = {
      transaction_amount: valorTotal,
      description: "Reserva de Espaço (TESTE 10 REAIS)",
      external_reference: externalReference,
      payment_method_id: "pix", // Usando PIX como exemplo
      installments: 1,
      marketplace: "dezko",
      marketplace_fee: taxaAplicacao,
      additional_info: {
        items: [
          {
            id: "item-teste-10reais",
            title: "Reserva de Espaço (TESTE 10 REAIS)",
            description: "Teste de integração de Split Payments - 10 Reais",
            category_id: "services",
            quantity: 1,
            unit_price: valorTotal
          }
        ]
      },
      application_fee: taxaAplicacao,
      capture: true,
      collector: {
        id: vendedorId
      }
    };
    
    console.log("Payload do pagamento:", JSON.stringify(payloadPagamento, null, 2));
    
    const pagamentoResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-Idempotency-Key": externalReference
      },
      body: JSON.stringify(payloadPagamento)
    });
    
    const pagamentoData = await pagamentoResponse.json();
    
    if (!pagamentoResponse.ok) {
      console.log("❌ Erro ao criar pagamento:");
      console.log(JSON.stringify(pagamentoData, null, 2));
      throw new Error(`Erro ao criar pagamento: ${pagamentoData.message || JSON.stringify(pagamentoData)}`);
    }
    
    console.log("✅ Pagamento criado com sucesso!");
    console.log("ID do pagamento:", pagamentoData.id);
    console.log("Status:", pagamentoData.status);
    
    if (pagamentoData.point_of_interaction && pagamentoData.point_of_interaction.transaction_data) {
      console.log("\n📱 Dados para pagamento PIX:");
      console.log(`QR Code: ${pagamentoData.point_of_interaction.transaction_data.qr_code_base64}`);
      console.log(`Código PIX: ${pagamentoData.point_of_interaction.transaction_data.qr_code}`);
    }
    
    console.log("\n✅ Detalhes da divisão do pagamento:");
    console.log(`- Valor total: R$ ${valorTotal.toFixed(2)}`);
    console.log(`- Taxa da aplicação (Dezko): R$ ${taxaAplicacao.toFixed(2)} (${(taxaAplicacao / valorTotal * 100).toFixed(2)}%)`);
    console.log(`- Valor para o vendedor: R$ ${valorVendedor.toFixed(2)} (${(valorVendedor / valorTotal * 100).toFixed(2)}%)`);
    
    return { success: true, data: pagamentoData };
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
testarPagamentoSplit()
  .then(result => {
    if (result.success) {
      console.log("\n🎉 Teste de split payment concluído com sucesso!");
      console.log("\n⚠️ IMPORTANTE: Para testar o pagamento completo, acesse um dos links acima");
      console.log("   ou use o código PIX gerado. Este é um pagamento de TESTE e uma cobrança real será feita,");
      console.log("   mas você pode cancelá-la posteriormente no painel do Mercado Pago.");
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
