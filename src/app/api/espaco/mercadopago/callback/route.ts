import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Constantes do Mercado Pago
const MERCADO_PAGO_APP_ID = process.env.MERCADO_PAGO_APP_ID;
const MERCADO_PAGO_CLIENT_SECRET = process.env.MERCADO_PAGO_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/espaco/mercadopago/callback`;

export async function GET(req: NextRequest) {
  try {
    // Obter parâmetros da URL
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const stateStr = searchParams.get("state");
    
    // Verificar se o código de autorização está presente
    if (!code) {
      console.error("Código de autorização não fornecido");
      return RedirectToError("missing_code");
    }

    // Verificar se o state está presente e é válido
    if (!stateStr) {
      console.error("Estado não fornecido");
      return RedirectToError("missing_state");
    }

    // Decodificar o state
    let state;
    try {
      state = JSON.parse(Buffer.from(stateStr, 'base64').toString());
    } catch (error) {
      console.error("Erro ao decodificar estado:", error);
      return RedirectToError("invalid_state");
    }

    // Verificar se o ID do espaço está presente
    if (!state.espacoId) {
      console.error("ID do espaço não encontrado no estado");
      return RedirectToError("missing_espaco_id");
    }

    // Validar configuração
    if (!MERCADO_PAGO_APP_ID || !MERCADO_PAGO_CLIENT_SECRET) {
      console.error("Configuração do Mercado Pago incompleta");
      return RedirectToError("configuration_error");
    }

    // Trocar o código de autorização por um token de acesso
    const tokenResponse = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        client_id: MERCADO_PAGO_APP_ID,
        client_secret: MERCADO_PAGO_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Erro ao obter token de acesso:", errorData);
      return RedirectToError("token_exchange_error");
    }

    const tokenData = await tokenResponse.json();
    
    // Extrair dados relevantes
    const {
      access_token,
      refresh_token,
      user_id,
      public_key,
      expires_in
    } = tokenData;

    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    // Atualizar informações do espaço
    await prisma.espaco.update({
      where: {
        id: state.espacoId
      },
      data: {
        mercadoPagoAccessToken: access_token,
        mercadoPagoRefreshToken: refresh_token,
        mercadoPagoUserId: user_id,
        mercadoPagoPublicKey: public_key,
        mercadoPagoTokenExpiresAt: expiresAt,
        mercadoPagoIntegrated: true
      }
    });

    // Redirecionar para a página de sucesso
    return NextResponse.redirect(new URL('/dashboard/espaco/conexao-mp?success=true', req.url));
  } catch (error) {
    console.error("[ESPACO_MP_CALLBACK_GET]", error);
    return RedirectToError("server_error");
  }
}

// Função auxiliar para redirecionar em caso de erro
function RedirectToError(errorCode: string) {
  return NextResponse.redirect(
    new URL(`/dashboard/espaco/conexao-mp?error=${errorCode}`, process.env.NEXT_PUBLIC_APP_URL)
  );
}
