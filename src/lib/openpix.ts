import { createClient } from '@woovi/node-sdk';

// Estender o tipo CreateResponse para incluir os campos que esperamos receber
interface WooviCreateResponse {
  id?: string;
  correlationID?: string;
  value?: number;
  comment?: string;
  expiresAt?: string;
  status?: string;
  transactionID?: string;
  qrCodeImage?: string;
  brCode?: string;
  paymentLinkUrl?: string;
  paymentLinkID?: string;
  paymentMethods?: {
    pix?: {
      qrCodeImage?: string;
      brCode?: string;
      [key: string]: any;
    }
    [key: string]: any;
  }
  [key: string]: any; // Para outros campos que possam existir
}

// Interface que vamos usar em nossa aplicação
interface ChargeResponse {
  id?: string;
  correlationID?: string;
  value: number;
  comment?: string;
  expiresAt?: string;
  status?: string;
  transactionID?: string;
  qrCodeImage?: string;
  brCode?: string;
  [key: string]: any; // Para outros campos que possam existir
}

// Interfaces para as respostas da API
interface ListResponse {
  charges?: ChargeResponse[];
  items?: any[];
  pageInfo?: any;
  [key: string]: any;
}

// Obter a appId da variável de ambiente
const appId = process.env.OPENPIX_AUTH_KEY || '';

// Função para verificar se a configuração OpenPix está completa
export function isOpenPixConfigured(): boolean {
  return Boolean(appId) && appId.length > 0;
}

// Verificar a configuração antes de criar o cliente
if (!isOpenPixConfigured()) {
  console.warn('OPENPIX_AUTH_KEY não está configurada no .env');
}

// Criar o cliente OpenPix
export const openPixClient = createClient({
  appId,
});

// Função utilitária para criar uma cobrança Pix
export interface SplitParam {
  walletId: string;
  value: number; // valor em centavos
}

export interface CreatePixChargeParams {
  correlationID: string;
  value: number;
  comment: string;
  expiresIn: number;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  splits?: SplitParam[];
}

// Função para criar uma cobrança
export async function createPixCharge(params: CreatePixChargeParams): Promise<ChargeResponse> {
  if (!isOpenPixConfigured()) {
    throw new Error('OpenPix não está configurado corretamente. Verifique as variáveis de ambiente.');
  }
  
  try {
    const response = await openPixClient.charge.create(params);
    
    // Log detalhado da resposta para entender sua estrutura
    console.log('Resposta completa da API OpenPix:', JSON.stringify(response, null, 2));
    
    // Tratar a resposta como WooviCreateResponse para acessar os campos esperados
    const wooviResponse = response as unknown as WooviCreateResponse;
    
    // Preparar resposta padronizada com todos os campos possíveis
    const chargeResponse: ChargeResponse = {
      ...response,
      // Garantir campos mais importantes
      id: wooviResponse.id || wooviResponse.transactionID || wooviResponse.correlationID,
      qrCodeImage: wooviResponse.qrCodeImage || 
                  (wooviResponse.paymentMethods?.pix?.qrCodeImage) || 
                  (wooviResponse.paymentLinkUrl ? `https://api.openpix.com.br/openpix/charge/brcode/image/${wooviResponse.paymentLinkID}.png` : ''),
      brCode: wooviResponse.brCode || 
              (wooviResponse.paymentMethods?.pix?.brCode) || 
              '',
      value: wooviResponse.value || 0
    };
    
    return chargeResponse;
  } catch (error) {
    console.error('Erro ao criar cobrança OpenPix:', error);
    throw error;
  }
}

// Função para consultar uma cobrança pelo correlationID
export async function findChargeByCorrelationID(correlationID: string): Promise<ChargeResponse | undefined> {
  if (!isOpenPixConfigured()) {
    throw new Error('OpenPix não está configurado corretamente. Verifique as variáveis de ambiente.');
  }
  
  try {
    // O SDK atual não tem o método findByCorrelationID diretamente
    // Vamos contornar isso usando list e filtrando
    const response = await openPixClient.charge.list();
    
    // Verificar os possíveis campos onde a lista de cobranças pode estar
    const chargeList = (response as any).charges || (response as any).items || [];
    
    if (Array.isArray(chargeList)) {
      return chargeList.find((charge: ChargeResponse) => 
        charge.correlationID === correlationID
      );
    }
    
    return undefined;
  } catch (error) {
    console.error(`Erro ao buscar cobrança pelo correlationID ${correlationID}:`, error);
    throw error;
  }
}

// Função para consultar uma cobrança pelo ID
export async function getCharge(chargeId: string): Promise<ChargeResponse> {
  if (!isOpenPixConfigured()) {
    throw new Error('OpenPix não está configurado corretamente. Verifique as variáveis de ambiente.');
  }
  
  try {
    const response = await openPixClient.charge.get({
      id: chargeId
    });
    return response as unknown as ChargeResponse;
  } catch (error) {
    console.error(`Erro ao buscar cobrança pelo ID ${chargeId}:`, error);
    throw error;
  }
}

// Função para testar a conexão com OpenPix
export async function testOpenPixConnection() {
  if (!isOpenPixConfigured()) {
    return {
      success: false,
      message: 'OpenPix não está configurado. Verifique OPENPIX_AUTH_KEY no .env.',
      response: null
    };
  }
  
  try {
    // Tenta buscar todas as cobranças como teste
    const response = await openPixClient.charge.list();
    
    return {
      success: true,
      message: 'Conexão com OpenPix estabelecida com sucesso!',
      response: {
        // Usar estrutura genérica para garantir compatibilidade
        data: response
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Falha na conexão: ${error.message || 'Erro desconhecido'}`,
      error: error
    };
  }
}

/**
 * Interface para representar uma subconta/destinatário no OpenPix
 */
export interface OpenPixDestination {
  id?: string;
  name: string;
  documentType?: string;
  document?: string;
  description?: string;
  pixKey: string;
  status?: string;
}

/**
 * Configura a subconta do lojista no OpenPix
 * @param espacoId ID do espaço do lojista
 * @param pixKey Chave PIX do lojista para recebimento dos pagamentos
 * @param espacoNome Nome do espaço/lojista (opcional)
 * @param espacoDoc Documento do lojista (opcional)
 * @returns O ID da wallet/destination criada ou atualizada
 */
export async function setupOpenPixForMerchant(
  espacoId: string, 
  pixKey: string, 
  espacoNome?: string, 
  espacoDoc?: string
): Promise<string> {
  if (!isOpenPixConfigured()) {
    throw new Error('OpenPix não está configurado corretamente. Verifique as variáveis de ambiente.');
  }
  
  try {
    // Identificador único para a subconta baseado no ID do espaço
    const destinationId = `merchant_${espacoId.replace(/-/g, "")}`;
    
    // Criar ou atualizar a subconta no OpenPix
    // Na API real, isso seria feito usando o cliente OpenPix
    // Ex: await openPixClient.destination.create({ ... })
    console.log(`Configurando subconta OpenPix para lojista: ${espacoNome || espacoId}`);
    
    // Simular a criação da subconta para testes
    const destination: OpenPixDestination = {
      id: destinationId,
      name: espacoNome || `Lojista ${espacoId.substring(0, 8)}`,
      pixKey: pixKey,
      documentType: espacoDoc?.length === 11 ? 'CPF' : 'CNPJ',
      document: espacoDoc || '00000000000',
      description: `Subconta para o espaço ${espacoId}`
    };
    
    // Na implementação real, chamaríamos a API do OpenPix
    // Código comentado abaixo mostra como seria numa implementação real
    /*
    const response = await openPixClient.destination.create({
      name: destination.name,
      pixKey: destination.pixKey,
      documentType: destination.documentType,
      document: destination.document,
      description: destination.description
    });
    return response.id;
    */
    
    // Para esta implementação de demonstração, retornamos o ID simulado
    return destinationId;
  } catch (error) {
    console.error('Erro ao configurar subconta OpenPix para lojista:', error);
    throw error;
  }
}
