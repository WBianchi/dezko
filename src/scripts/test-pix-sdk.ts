// Script para testar o SDK do Mercado Pago para gerar PIX
import { mercadoPagoService } from "@/lib/mercadopago";

async function testPixSDK() {
  try {
    console.log("Iniciando teste de PIX com Mercado Pago...");
    
    // Definir dados de teste
    const data = {
      transactionAmount: 100, // R$ 100,00
      payerEmail: "teste@exemplo.com",
      payerName: "Usuário Teste",
      description: "Teste de Integração PIX",
      reservationId: "test-reservation-" + Date.now(),
      espacoId: "test-space-id",
      notificationUrl: "https://webhook.site/your-test-webhook"
    };
    
    console.log("Dados para geração de PIX:", data);
    
    // Tentar criar QR Code
    const result = await mercadoPagoService.createQrCode(data);
    
    console.log("PIX gerado com sucesso!");
    console.log("QR Code:", result.qr_code);
    console.log("Expiração:", result.expiration_date);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Erro ao gerar PIX:", error);
    return { success: false, error };
  }
}

// Executar o teste
testPixSDK().then((result) => {
  console.log("Resultado do teste:", result.success ? "SUCESSO" : "FALHA");
  process.exit(0);
});
