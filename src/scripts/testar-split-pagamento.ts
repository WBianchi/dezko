// Script para testar pagamentos com split no Mercado Pago
import { PrismaClient } from "@prisma/client";

// Inicializar o Prisma Client
const prisma = new PrismaClient();

// Função para gerar um ID aleatório para o pagamento
function gerarIdPagamento(): string {
  return `dezko_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

async function testarSplitPagamento() {
  console.log("🚀 Iniciando teste de Split Payments com Mercado Pago");
  console.log("===================================================\n");

  try {
    // 1. Buscar um espaço que tenha token do Mercado Pago
    console.log("Buscando espaço com token do Mercado Pago...");
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
        mercadoPagoAccessToken: true
      }
    });

    if (!espaco) {
      throw new Error("Nenhum espaço com token do Mercado Pago encontrado");
    }

    console.log(`✅ Espaço encontrado: ${espaco.nome} (ID: ${espaco.id})`);
    console.log(`   Token: ${espaco.mercadoPagoAccessToken?.substring(0, 10)}...`);
    console.log(`   Email: ${espaco.email}\n`);

    // 2. Buscar configurações da aplicação Dezko no Mercado Pago
    console.log("Buscando configurações da aplicação...");
    const config = await prisma.configuracao.findFirst({
      where: {
        tipo: "mercadopago"
      }
    });

    if (!config) {
      throw new Error("Configurações do Mercado Pago não encontradas");
    }

    const mpConfig = JSON.parse(config.valor);
    console.log(`✅ Configurações encontradas: Client ID: ${mpConfig.clientId}\n`);

    // 3. Criar payload para pagamento com split
    const externalReference = gerarIdPagamento();
    console.log(`Gerando pagamento de teste: ${externalReference}`);

    // Valores do pagamento com split
    const valorTotal = 100.00;  // R$ 100,00
    const taxaAplicacao = 10.00; // R$ 10,00 (10%)
    const valorEspaco = valorTotal - taxaAplicacao; // R$ 90,00 (90%)

    // Payload para criação de preferência com split
    const payloadPreferencia = {
      external_reference: externalReference,
      items: [
        {
          id: "item-teste-1",
          title: "Reserva de Espaço (TESTE)",
          description: "Teste de integração de Split Payments",
          category_id: "services",
          quantity: 1,
          unit_price: valorTotal
        }
      ],
      marketplace_fee: taxaAplicacao, // Taxa da aplicação (Dezko)
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/falha`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/pendente`
      },
      auto_return: "approved"
    };

    console.log("Payload de preferência criado:");
    console.log(JSON.stringify(payloadPreferencia, null, 2));

    // 4. Enviando solicitação para criar preferência
    console.log("\nEnviando solicitação para o Mercado Pago...");
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${espaco.mercadoPagoAccessToken}`
      },
      body: JSON.stringify(payloadPreferencia)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro ao criar preferência:");
      console.error(JSON.stringify(data, null, 2));
      throw new Error(`Erro ao criar preferência: ${data.message}`);
    }

    console.log("✅ Preferência criada com sucesso!");
    console.log("ID da preferência:", data.id);
    console.log("\nLinks de pagamento:");
    console.log(`- Sandbox: ${data.sandbox_init_point}`);
    console.log(`- Produção: ${data.init_point}`);

    console.log("\n🔍 Detalhes da divisão do pagamento:");
    console.log(`- Valor total: R$ ${valorTotal.toFixed(2)}`);
    console.log(`- Taxa da aplicação (Dezko): R$ ${taxaAplicacao.toFixed(2)} (${(taxaAplicacao / valorTotal * 100).toFixed(2)}%)`);
    console.log(`- Valor para o espaço: R$ ${valorEspaco.toFixed(2)} (${(valorEspaco / valorTotal * 100).toFixed(2)}%)`);

    console.log("\n✨ Teste concluído com sucesso!");
    console.log("\n⚠️ IMPORTANTE: Para testar o pagamento completo, acesse um dos links acima");
    console.log("   Este é um pagamento de TESTE, nenhuma cobrança real será feita.\n");

    return { success: true, data };
  } catch (error: any) {
    console.error("❌ Erro durante o teste:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testarSplitPagamento()
  .then(result => {
    if (result.success) {
      console.log("🎉 Teste de split payment concluído com sucesso!");
      process.exit(0);
    } else {
      console.error("😥 Teste falhou. Verifique os erros acima.");
      process.exit(1);
    }
  })
  .catch(error => {
    console.error("Erro inesperado:", error);
    process.exit(1);
  });
