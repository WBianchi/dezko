// Script para verificar o status do token e da conta do Mercado Pago
import { PrismaClient } from "@prisma/client";

// Inicializar o Prisma Client
const prisma = new PrismaClient();

async function verificarStatusMercadoPago() {
  console.log("🔍 Verificando status da integração com Mercado Pago");
  console.log("===================================================\n");

  try {
    // 1. Buscar o espaço com token do Mercado Pago
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
        mercadoPagoAccessToken: true,
        mercadoPagoTokenExpiresAt: true,
        mercadoPagoRefreshToken: true
      }
    });

    if (!espaco) {
      throw new Error("Nenhum espaço com token do Mercado Pago encontrado");
    }

    console.log(`✅ Espaço encontrado: ${espaco.nome} (ID: ${espaco.id})`);
    console.log(`   Email: ${espaco.email}`);
    
    // Verificar data de expiração
    const agora = new Date();
    const expiracaoToken = espaco.mercadoPagoTokenExpiresAt;
    
    if (expiracaoToken) {
      if (expiracaoToken > agora) {
        const tempoRestante = Math.floor((expiracaoToken.getTime() - agora.getTime()) / (1000 * 60 * 60));
        console.log(`   Token válido por mais ${tempoRestante} horas`);
      } else {
        console.log(`   ⚠️ Token EXPIRADO! Expirou em ${expiracaoToken.toLocaleString()}`);
        console.log("   É necessário reconectar-se ao Mercado Pago");
      }
    } else {
      console.log("   ⚠️ Data de expiração do token não disponível");
    }

    // 2. Verificar informações da conta usando o token
    console.log("\nVerificando informações da conta no Mercado Pago...");
    const response = await fetch("https://api.mercadopago.com/users/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${espaco.mercadoPagoAccessToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("❌ Erro ao consultar informações da conta:");
      console.log(JSON.stringify(data, null, 2));
      throw new Error(`Erro na API do Mercado Pago: ${data.message}`);
    }

    console.log("✅ Informações da conta obtidas com sucesso!");
    console.log("\n📋 Detalhes da conta:");
    console.log(`   ID do Usuário: ${data.id}`);
    console.log(`   Nome: ${data.first_name} ${data.last_name}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Status da conta: ${data.status}`);
    
    // Verificar permissões de pagamento
    if (data.permissions && data.permissions.length > 0) {
      console.log("\n🔐 Permissões disponíveis:");
      data.permissions.forEach((permission: string) => {
        console.log(`   - ${permission}`);
      });
    }
    
    // Verificar status do marketplace
    console.log("\n🏪 Status do Marketplace:");
    if (data.marketplace) {
      console.log(`   Marketplace habilitado: ${data.marketplace}`);
    } else {
      console.log("   ⚠️ Conta não está configurada como marketplace");
      console.log("   É necessário solicitar a habilitação para operações de split payment");
    }
    
    // Verificar status de pagamentos
    console.log("\n💳 Status de Pagamentos:");
    if (data.site_status) {
      const paymentStatus = data.site_status.payments;
      console.log(`   Recebimento de pagamentos: ${paymentStatus ? "Habilitado" : "Desabilitado"}`);
    } else {
      console.log("   ⚠️ Informações de status de pagamento não disponíveis");
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

// Executar a verificação
verificarStatusMercadoPago()
  .then(result => {
    if (result.success) {
      console.log("\n🎉 Verificação concluída com sucesso!");
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
