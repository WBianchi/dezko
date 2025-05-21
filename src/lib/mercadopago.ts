import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import { randomUUID } from "crypto"
import { prisma } from '@/lib/prisma'

// Configuração global do Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
})

const payment = new Payment(client)

export interface CreatePaymentInput {
  reservationId: string
  amount: number
  paymentMethodId: string
  token: string
  installments: number
  issuerId: string
  payer: {
    email: string
    first_name?: string
    last_name?: string
    identification: {
      type: string
      number: string
    }
    address?: {
      zip_code: string
      street_name: string
      street_number: string
      neighborhood: string
      city: string
      federal_unit: string
    }
  }
}

export interface CreateSplitPaymentInput extends CreatePaymentInput {
  spaceId: string;  // ID do espaço (vendedor)
  platformFee?: number; // Taxa da plataforma em porcentagem (opcional)
}

export const mercadoPagoService = {
  async createPayment({
    reservationId,
    amount,
    paymentMethodId,
    token,
    installments,
    issuerId,
    payer,
  }: CreatePaymentInput) {
    try {
      const paymentData = {
        transaction_amount: Number(amount),
        token,
        description: `Pagamento da reserva #${reservationId}`,
        installments: Number(installments),
        payment_method_id: paymentMethodId,
        issuer_id: issuerId,
        payer: {
          email: payer.email,
          first_name: payer.first_name,
          last_name: payer.last_name,
          identification: {
            type: payer.identification.type,
            number: payer.identification.number,
          },
          address: payer.address,
        },
        metadata: {
          reservation_id: reservationId,
        },
      };

      const response = await payment.create({ body: paymentData });
      return response;
    } catch (error) {
      console.error('Erro ao criar pagamento no Mercado Pago:', error);
      throw error;
    }
  },

  async getPaymentStatus(paymentId: string) {
    try {
      const response = await payment.get({ id: paymentId });
      return response;
    } catch (error) {
      console.error('Erro ao obter status do pagamento:', error);
      throw error;
    }
  },

  async createSellerAccount(userId: string, email: string) {
    try {
      // Implementação para criar conta de vendedor no Mercado Pago
      // Esta é uma simulação - a implementação real depende da API do Mercado Pago
      return {
        userId,
        email,
        accountId: `mp_seller_${randomUUID()}`,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao criar conta de vendedor:', error);
      throw error;
    }
  },

  async getSellerCredentials(code: string) {
    try {
      // Implementação para obter credenciais do vendedor usando código OAuth
      // Esta é uma simulação - a implementação real depende da API do Mercado Pago
      return {
        accessToken: `TEST_AT_${randomUUID()}`,
        refreshToken: `TEST_RT_${randomUUID()}`,
        userId: `TEST_USER_${randomUUID()}`,
      };
    } catch (error) {
      console.error('Erro ao obter credenciais do vendedor:', error);
      throw error;
    }
  },

  async createSplitPayment({
    reservationId,
    amount,
    paymentMethodId,
    token,
    installments,
    issuerId,
    payer,
    spaceId,
    platformFee = 10, // Taxa padrão de 10% se não for especificada
  }: CreateSplitPaymentInput) {
    try {
      // Buscar informações do espaço (vendedor)
      const espaco = await prisma.espaco.findUnique({
        where: { id: spaceId },
        select: {
          id: true,
          nome: true,
          mercadoPagoUserId: true,
          mercadoPagoAccessToken: true,
          mercadoPagoIntegrated: true,
        },
      });

      if (!espaco) {
        throw new Error(`Espaço não encontrado: ${spaceId}`);
      }

      if (!espaco.mercadoPagoIntegrated || !espaco.mercadoPagoAccessToken || !espaco.mercadoPagoUserId) {
        throw new Error(`Espaço não está integrado com o Mercado Pago: ${spaceId}`);
      }

      // Calcular valor da comissão
      const parsedAmount = Number(amount);
      const commissionAmount = (parsedAmount * platformFee) / 100;

      // Dados do pagamento
      const paymentData: any = {
        transaction_amount: parsedAmount,
        token,
        description: `Pagamento da reserva #${reservationId}`,
        installments: Number(installments),
        payment_method_id: paymentMethodId,
        issuer_id: issuerId,
        payer: {
          email: payer.email,
          first_name: payer.first_name,
          last_name: payer.last_name,
          identification: {
            type: payer.identification.type,
            number: payer.identification.number,
          },
          address: payer.address,
        },
        metadata: {
          reservation_id: reservationId,
          space_id: spaceId,
        },
      };

      // Configurar cliente Mercado Pago com o token da plataforma
      const mpClient = new MercadoPagoConfig({ 
        accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
      });
      
      const mpPayment = new Payment(mpClient);

      // Configurar split payment se o espaço tiver integração com MP
      // Esta é a parte mais importante para a funcionalidade de marketplace
      paymentData.application_fee = commissionAmount;
      paymentData.collector_id = espaco.mercadoPagoUserId;

      console.log('Criando pagamento com split:', JSON.stringify(paymentData, null, 2));

      // Criar pagamento com split
      const response = await mpPayment.create({ body: paymentData });

      // Registrar pagamento no banco de dados
      await prisma.pedido.update({
        where: { id: reservationId },
        data: {
          mercadoPagoPaymentId: response.id.toString(),
          statusPedido: mapStatusFromMP(response.status),
          formaPagamento: 'CARTAO',
        },
      });

      return response;
    } catch (error) {
      console.error('Erro ao criar pagamento com split no Mercado Pago:', error);
      throw error;
    }
  },

  // Método para criar uma preferência de pagamento com split
  async createSplitPreference({
    reservationId,
    amount,
    spaceId,
    platformFee = 10, // Taxa padrão de 10% se não for especificada
    payerEmail,
    payerName,
    backUrls,
    notificationUrl
  }) {
    try {
      // Buscar informações do espaço (vendedor)
      const espaco = await prisma.espaco.findUnique({
        where: { id: spaceId },
        select: {
          id: true,
          nome: true,
          mercadoPagoUserId: true,
          mercadoPagoAccessToken: true,
          mercadoPagoIntegrated: true,
        },
      });

      if (!espaco) {
        throw new Error(`Espaço não encontrado: ${spaceId}`);
      }

      // Calcular valor da comissão
      const parsedAmount = Number(amount);
      const commissionAmount = (parsedAmount * platformFee) / 100;

      // Configurar cliente Mercado Pago
      const mpClient = new MercadoPagoConfig({ 
        accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
      });
      
      const preferenceClient = new Preference(mpClient);

      // Obter dados completos do pagador da sessão, se disponível
      // Em um ambiente real, você deve obter esses dados do frontend ou do banco de dados
      const dadosPagadorCompletos = sessionStorage.getItem('dadosPagador')
        ? JSON.parse(sessionStorage.getItem('dadosPagador') || '{}')
        : null;
      
      // Dados da preferência
      const preferenceData: any = {
        items: [
          {
            id: reservationId,
            title: `Reserva em ${espaco.nome}`,
            quantity: 1,
            unit_price: parsedAmount,
            currency_id: "BRL",
          },
        ],
        payer: {
          email: payerEmail,
          name: payerName,
          // Adicionar dados completos do pagador se disponíveis
          ...(dadosPagadorCompletos && {
            identification: {
              type: "CPF",
              number: dadosPagadorCompletos.cpf.replace(/\D/g, ''),
            },
            address: {
              zip_code: dadosPagadorCompletos.cep.replace(/\D/g, ''),
              street_name: dadosPagadorCompletos.endereco,
              street_number: dadosPagadorCompletos.numero,
              neighborhood: dadosPagadorCompletos.bairro,
              city: dadosPagadorCompletos.cidade,
              federal_unit: dadosPagadorCompletos.estado,
            },
          }),
        },
        metadata: {
          reservation_id: reservationId,
          space_id: spaceId,
        },
        external_reference: reservationId,
        auto_return: "approved",
      };

      // Adicionar URLs de callback se fornecidas
      if (backUrls) {
        preferenceData.back_urls = backUrls;
      }

      if (notificationUrl) {
        preferenceData.notification_url = notificationUrl;
      }

      // Configurar split payment se o espaço tiver integração com MP
      if (espaco.mercadoPagoIntegrated && espaco.mercadoPagoUserId) {
        preferenceData.marketplace_fee = commissionAmount;
        preferenceData.collector_id = espaco.mercadoPagoUserId;
      }

      console.log('Criando preferência com split:', JSON.stringify(preferenceData, null, 2));

      // Criar preferência
      const response = await preferenceClient.create({ body: preferenceData });

      // Registrar preferência no banco de dados
      await prisma.pedido.update({
        where: { id: reservationId },
        data: {
          mercadoPagoPreferenceId: response.id,
        },
      });

      return response;
    } catch (error) {
      console.error('Erro ao criar preferência com split no Mercado Pago:', error);
      throw error;
    }
  },

  async createQrCode({
    transactionAmount,
    payerEmail,
    payerName,
    description,
    reservationId,
    espacoId,
    notificationUrl,
    payerIdentification,
    payerAddress,
  }: {
    transactionAmount: number;
    payerEmail: string;
    payerName: string;
    description: string;
    reservationId: string;
    espacoId: string;
    notificationUrl?: string;
    payerIdentification?: {
      type: string;
      number: string;
    };
    payerAddress?: {
      zip_code: string;
      street_name: string;
      street_number: string;
      neighborhood: string;
      city: string;
      federal_unit: string;
    };
  }) {
    try {
      const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });
      const payment = new Payment(client);

      const paymentData = {
        transaction_amount: Number(transactionAmount),
        description,
        payment_method_id: 'pix',
        payer: {
          email: payerEmail,
          first_name: payerName?.split(' ')[0] || '',
          last_name: payerName?.split(' ')[1] || '',
        },
        metadata: {
          reservation_id: reservationId,
          espaco_id: espacoId,
        },
      };

      if (notificationUrl) {
        paymentData.notification_url = notificationUrl;
      }

      console.log('Criando pagamento PIX:', JSON.stringify(paymentData, null, 2));
      const result = await payment.create({ body: paymentData });

      // Atualizar pedido com informações do pagamento
      await prisma.pedido.update({
        where: { id: reservationId },
        data: {
          mercadoPagoPaymentId: result.id.toString(),
          statusPedido: 'PENDENTE',
          formaPagamento: 'PIX',
        },
      });

      // Retornar dados do QR Code
      return {
        id: result.id,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
        expiration_date: result.point_of_interaction?.transaction_data?.expiration_date,
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  },

  async createSplitQrCode({
    transactionAmount,
    payerEmail,
    payerName,
    userId,
    platformAmount,
    description,
    reservationId,
    espacoId,
    notificationUrl,
    payerIdentification,
    payerAddress,
  }: {
    transactionAmount: number;
    payerEmail: string;
    payerName: string;
    userId: string;
    platformAmount: number;
    description: string;
    reservationId: string;
    espacoId: string;
    notificationUrl?: string;
    payerIdentification?: {
      type: string;
      number: string;
    };
    payerAddress?: {
      zip_code: string;
      street_name: string;
      street_number: string;
      neighborhood: string;
      city: string;
      federal_unit: string;
    };
  }) {
    try {
      const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });
      const payment = new Payment(client);

      const paymentData = {
        transaction_amount: Number(transactionAmount),
        description,
        payment_method_id: 'pix',
        payer: {
          email: payerEmail,
          first_name: payerName?.split(' ')[0] || '',
          last_name: payerName?.split(' ')[1] || '',
        },
        metadata: {
          reservation_id: reservationId,
          espaco_id: espacoId,
        },
        application_fee: platformAmount,
        collector_id: userId,
      };

      if (notificationUrl) {
        paymentData.notification_url = notificationUrl;
      }

      console.log('Criando pagamento PIX com split:', JSON.stringify(paymentData, null, 2));
      const result = await payment.create({ body: paymentData });

      // Atualizar pedido com informações do pagamento
      await prisma.pedido.update({
        where: { id: reservationId },
        data: {
          mercadoPagoPaymentId: result.id.toString(),
          statusPedido: 'PENDENTE',
          formaPagamento: 'PIX',
        },
      });

      // Retornar dados do QR Code
      return {
        id: result.id,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
        expiration_date: result.point_of_interaction?.transaction_data?.expiration_date,
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX com split:', error);
      throw error;
    }
  },
  
  async testMercadoPagoToken(accessToken: string) {
    try {
      const testClient = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(testClient);
      
      // Tentar fazer uma chamada simples para verificar se o token funciona
      // Normalmente usamos um endpoint "leve" como o de teste
      const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na validação do token: ${response.status} ${response.statusText}`);
      }
      
      // Se chegou aqui, o token é válido
      const data = await response.json();
      return {
        valid: true,
        data
      };
    } catch (error) {
      console.error('Erro ao validar token do Mercado Pago:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  },
  
  async createMercadoPagoPayment(accessToken: string, paymentData: any) {
    try {
      const paymentClient = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(paymentClient);
      
      // Criar pagamento usando o token do vendedor
      const response = await payment.create({ body: paymentData });
      
      return {
        success: true,
        paymentId: response.id,
        status: response.status,
        statusDetail: response.status_detail,
        data: response
      };
    } catch (error) {
      console.error('Erro ao criar pagamento com token específico:', error);
      return {
        success: false,
        error: error.message,
        errorDetail: error.cause ? error.cause[0].description : null
      };
    }
  }
}

// Função auxiliar para mapear status do Mercado Pago para status do sistema
function mapStatusFromMP(mpStatus: string): string {
  const statusMap = {
    approved: 'PAGO',
    authorized: 'PENDENTE',
    in_process: 'PENDENTE',
    pending: 'PENDENTE',
    rejected: 'REJEITADO',
    cancelled: 'CANCELADO',
    refunded: 'REEMBOLSADO',
    charged_back: 'ESTORNADO',
  };
  
  return statusMap[mpStatus] || 'PENDENTE';
}
