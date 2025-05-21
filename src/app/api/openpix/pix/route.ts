import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createPixCharge, isOpenPixConfigured } from '@/lib/openpix';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(auth);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se OpenPix está configurado
    if (!isOpenPixConfigured()) {
      return NextResponse.json(
        { error: 'OpenPix não está configurado. Verifique OPENPIX_AUTH_KEY no .env' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { pedidoId, valor } = body;

    if (!pedidoId || !valor) {
      return NextResponse.json(
        { error: 'ID do pedido e valor são necessários' },
        { status: 400 }
      );
    }

    // Buscar informações do pedido e configurações de split
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        usuario: true,
        espaco: {
          include: {
            comissao: true // Incluir informações de comissão específica do espaço
          }
        },
        plano: true // Incluir informações do plano para possível comissão baseada em plano
      },
    });
    
    // Buscar configuração global de split
    const configSplit = await prisma.$queryRaw<any[]>`
      SELECT * FROM "ConfigSplit" WHERE type = 'global' LIMIT 1
    `;
    const globalConfig = configSplit?.[0] || null;
    
    // Verificar se há comissão específica para o plano
    let planCommission = null;
    if (pedido?.planoId) {
      const planCommissionResult = await prisma.$queryRaw<any[]>`
        SELECT * FROM "PlanCommission" WHERE "planId" = ${pedido.planoId} LIMIT 1
      `;
      planCommission = planCommissionResult?.[0] || null;
    }

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Criar payload para a API OpenPix
    const pixPayload: any = {
      correlationID: `pedido-${pedido.id}`,
      value: Math.round(pedido.valor * 100), // Converter para centavos
      comment: `Reserva em ${pedido.espaco.nome}`,
      expiresIn: 3600, // 1 hora para pagamento
      customer: {
        name: pedido.usuario.nome || 'Cliente',
        email: pedido.usuario.email || 'cliente@exemplo.com',
        phone: pedido.usuario.telefone || '',
      }
    };
    
    // Verificar se OpenPix está habilitado para split nas configurações globais
    if (globalConfig && globalConfig.openPixEnabled) {
      // Determinar qual comissão usar (espaço > plano > global, nessa ordem de prioridade)
      let comissaoType = globalConfig.commissionType;
      let comissaoValue = globalConfig.commissionValue;
      let useComissao = true;
      let comissaoSource = 'global';
      
      // Se houver comissão específica para este espaço, usar essa
      if (pedido.espaco.comissao) {
        // Adaptar o modelo antigo se necessário
        if ('type' in pedido.espaco.comissao && 'value' in pedido.espaco.comissao) {
          // Modelo antigo
          comissaoType = (pedido.espaco.comissao as any).type === 'fixed' ? 'fixed' : 'percentage';
          comissaoValue = (pedido.espaco.comissao as any).value;
        } else if ('commissionType' in pedido.espaco.comissao && 'commissionValue' in pedido.espaco.comissao) {
          // Modelo novo
          comissaoType = (pedido.espaco.comissao as any).commissionType;
          comissaoValue = (pedido.espaco.comissao as any).commissionValue;
        }
        comissaoSource = 'espaço';
      } 
      // Se não tiver comissão do espaço mas tiver ativado comissão por plano e existir uma
      else if (globalConfig.enablePlanCommission && planCommission) {
        comissaoType = planCommission.commissionType;
        comissaoValue = planCommission.commissionValue;
        comissaoSource = 'plano';
      }

      // Verificar se o espaço tem uma wallet configurada
      const openPixWalletId = (pedido.espaco as any).openPixWalletId;
      const adminWalletId = globalConfig.openPixWalletId;
      
      if (openPixWalletId && adminWalletId && useComissao) {
        console.log(`Configurando split para o espaço ${pedido.espaco.nome} com wallet ${openPixWalletId}`);
        console.log(`Usando comissão do tipo ${comissaoSource}: ${comissaoType} de valor ${comissaoValue}`);
        
        // Calcular valor da comissão baseado no tipo (percentual, fixo, ou baseado em plano)
        let valorComissao = 0;
        const valorTotal = Math.round(pedido.valor * 100); // Valor total em centavos
        
        if (comissaoType === 'percentage') {
          // Se for percentual, calcular com base no valor total
          valorComissao = Math.round(valorTotal * (comissaoValue / 100));
          console.log(`Comissão percentual de ${comissaoValue}% = ${valorComissao} centavos`);
        } else if (comissaoType === 'fixed') {
          // Se for valor fixo, converter para centavos
          valorComissao = Math.round(comissaoValue * 100);
          console.log(`Comissão fixa de ${valorComissao} centavos`);
        } else if (comissaoType === 'plan' && pedido.plano) {
          // Se for baseado no plano, usar o valor do plano como base
          // Implementação simplificada: usa o valor do plano como comissão
          valorComissao = Math.round(pedido.plano.preco * 100);
          console.log(`Comissão baseada no plano: ${valorComissao} centavos`);
        }
        
        // Valor para o espaço (valor total - comissão)
        const valorEspaco = valorTotal - valorComissao;
        
        // Configurar o array de splits
        pixPayload.splits = [
          {
            walletId: openPixWalletId, // Wallet do espaço
            value: valorEspaco // Valor para o espaço (descontada a comissão)
          },
          {
            walletId: adminWalletId, // Wallet do admin
            value: valorComissao // Valor da comissão para o admin
          }
        ];
        
        console.log(`Split configurado: ${valorEspaco} centavos para o espaço, ${valorComissao} centavos para o admin`);
      } else {
        if (!openPixWalletId) {
          console.log(`Espaço não tem wallet configurada. Todo o valor irá para a conta principal.`);
        }
        if (!adminWalletId) {
          console.log(`Admin não tem wallet configurada. Não é possível configurar split.`);
        }
        if (!useComissao) {
          console.log(`Comissão não está habilitada para este espaço. Todo o valor irá para a conta principal.`);
        }
      }
    } else {
      console.log(`Split OpenPix não está habilitado nas configurações globais.`);
    }
    
    console.log('Enviando payload para OpenPix:', JSON.stringify(pixPayload, null, 2));
    
    // Criar uma cobrança PIX usando o SDK da Woovi
    try {
      const chargeResponse = await createPixCharge(pixPayload);
      
      // Log da resposta para debug
      console.log('Resposta da API OpenPix:', JSON.stringify(chargeResponse, null, 2));
      
      // Verificar se temos uma resposta válida
      if (!chargeResponse) {
        throw new Error('Resposta vazia da API OpenPix');
      }
      
      // Com o SDK da Woovi, podemos acessar diretamente os campos necessários
      const chargeId = chargeResponse.id || chargeResponse.transactionID || chargeResponse.correlationID;
      
      if (!chargeId) {
        throw new Error('Não foi possível obter o ID da cobrança');
      }
      
      console.log('Usando ID da cobrança:', chargeId);
      
      // Atualizar o pedido com o ID da cobrança usando SQL raw para evitar erros de tipagem
      await prisma.$executeRaw`UPDATE "Pedido" SET "openPixChargeId" = ${chargeId.toString()} WHERE id = ${pedidoId}`;
      
      // Extrair dados relevantes da resposta, com fallbacks caso não existam
      // A SDK da Woovi pode retornar a URL da imagem em locais diferentes na estrutura
      // Tentar todas as possibilidades de localização da URL do QR Code
      let qrCodeImage = (
        chargeResponse.qrCodeImage || 
        (chargeResponse.paymentMethods?.pix?.qrCodeImage) || 
        (chargeResponse.payment_methods?.pix?.qrCodeImage) || 
        (chargeResponse.payment_methods?.pix?.qr_code_image) ||
        (chargeResponse.charge?.qrCodeImage) ||
        ''
      );

      // Se ainda não encontramos uma URL válida, mas temos um ID, tentar construir a URL diretamente
      if (!qrCodeImage) {
        if (chargeResponse.paymentLinkID || chargeResponse.payment_link_id) {
          const linkId = chargeResponse.paymentLinkID || chargeResponse.payment_link_id;
          qrCodeImage = `https://api.openpix.com.br/openpix/charge/brcode/image/${linkId}.png`;
        } else if (chargeId) {
          // Tentar construir usando o chargeId
          qrCodeImage = `https://api.openpix.com.br/openpix/charge/${chargeId}/qrcode.png`;
        }
      }
      // Extrair o brCode considerando diferentes estruturas de resposta
      const brCode = (
        chargeResponse.brCode || 
        (chargeResponse.paymentMethods?.pix?.brCode) || 
        (chargeResponse.payment_methods?.pix?.brCode) ||
        (chargeResponse.payment_methods?.pix?.br_code) ||
        (chargeResponse.charge?.brCode) ||
        ''
      );
                  
      // Adicionar logs para debug
      console.log('QR Code Image URL:', qrCodeImage);
      console.log('brCode:', brCode);
      const expiresAt = chargeResponse.expiresAt || new Date(Date.now() + 3600 * 1000).toISOString();
      
      return NextResponse.json({
        success: true,
        pixData: {
          qrCodeImage,
          qrCodeText: brCode,
          pixCopiaECola: brCode,
          expirationDate: expiresAt,
          chargeId,
        },
      });
    } catch (error: any) {
      console.error('Erro ao criar cobrança PIX:', error);
      return NextResponse.json(
        { error: 'Falha ao gerar PIX', details: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao processar pagamento PIX:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
