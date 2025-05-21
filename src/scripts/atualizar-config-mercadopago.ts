// Script para atualizar as configurações do Mercado Pago no banco de dados
import { PrismaClient } from "@prisma/client";

// Inicializar o client do Prisma
const prisma = new PrismaClient();

async function atualizarConfigMercadoPago() {
  try {
    console.log("Iniciando atualização das configurações do Mercado Pago...");

    // Verificar se já existe uma configuração
    const configExistente = await prisma.configuracao.findFirst({
      where: {
        tipo: "mercadopago"
      }
    });

    // Obter valores do ambiente ou usar os defaults
    const clientId = process.env.MERCADO_PAGO_APP_ID || "1623365362922759";
    const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET || "e8kfcgG1zirfvPDUBGTkrtQ44ixJRZfG";
    
    // Criar objeto de configuração
    const configObj = {
      clientId,
      clientSecret,
      // Adicionar outras configurações necessárias aqui
    };

    // Converter para JSON
    const configJson = JSON.stringify(configObj);

    if (configExistente) {
      // Atualizar configuração existente
      console.log(`Atualizando configuração existente (ID: ${configExistente.id})...`);
      console.log(`- Novo Client ID: ${clientId}`);

      const configAtualizada = await prisma.configuracao.update({
        where: {
          id: configExistente.id
        },
        data: {
          valor: configJson
        }
      });

      console.log("✅ Configuração atualizada com sucesso!");
      console.log("Dados atualizados:", configAtualizada);
    } else {
      // Criar nova configuração
      console.log("Criando nova configuração para Mercado Pago...");
      
      const novaConfig = await prisma.configuracao.create({
        data: {
          tipo: "mercadopago",
          valor: configJson
        }
      });

      console.log("✅ Configuração criada com sucesso!");
      console.log("Nova configuração:", novaConfig);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao atualizar configurações do Mercado Pago:", error);
    return { success: false, error };
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
  }
}

// Executar a função
atualizarConfigMercadoPago()
  .then(result => {
    if (result.success) {
      console.log("Script executado com sucesso!");
      process.exit(0);
    } else {
      console.error("Falha na execução do script:", result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error("Erro inesperado:", error);
    process.exit(1);
  });
