#!/bin/bash

# Carregar variáveis de ambiente do arquivo .env
export $(grep -v '^#' /Users/willian/Documents/Dezko/dezko/.env | xargs)

# Configurações
API_BASE_URL="https://api.openpix.com.br/api/v1"
AUTH_KEY="$OPENPIX_AUTH_KEY"
CLIENT_ID="$OPENPIX_CLIENT_ID"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== TESTE FINAL DA API OPENPIX =====${NC}"
echo -e "${BLUE}URL Base: $API_BASE_URL${NC}"
echo -e "${BLUE}Client ID: $CLIENT_ID${NC}"
echo

# Criar uma cobrança direta com informações de destinatário para split
echo -e "${BLUE}Criando cobrança com destinatário de split...${NC}"

# Gerar dados únicos
TIMESTAMP=$(date +%s)
CHARGE_CORRELATION_ID="dezko-split-$TIMESTAMP"

# Criar uma cobrança direta com a informação de destinatário
CREATE_CHARGE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/charge" \
  -H "Authorization: $AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"correlationID\": \"$CHARGE_CORRELATION_ID\",
    \"value\": 1000,
    \"comment\": \"Teste de cobrança com destinatário\",
    \"destinationAlias\": \"dezko@split.com\",
    \"dueDate\": \"$(date -v+1d "+%Y-%m-%d")\",
    \"expiresIn\": 3600
  }")

# Mostrar resposta completa
echo -e "Resposta da cobrança com destinatário:\n$(echo "$CREATE_CHARGE_RESPONSE" | jq -r '.' 2>/dev/null || echo "$CREATE_CHARGE_RESPONSE")"
echo

# Testar cobrança com método anterior - simples
echo -e "${BLUE}Criando cobrança simples...${NC}"

SIMPLE_CHARGE_ID="dezko-simple-$TIMESTAMP"
CREATE_SIMPLE_CHARGE=$(curl -s -X POST "$API_BASE_URL/charge" \
  -H "Authorization: $AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"correlationID\": \"$SIMPLE_CHARGE_ID\",
    \"value\": 1000,
    \"comment\": \"Teste simples de cobrança\",
    \"expiresIn\": 3600
  }")

# Mostrar resposta
echo -e "Resposta da cobrança simples:\n$(echo "$CREATE_SIMPLE_CHARGE" | jq -r '.' 2>/dev/null || echo "$CREATE_SIMPLE_CHARGE")"

# Extrair informações importantes
QR_CODE_URL=$(echo "$CREATE_SIMPLE_CHARGE" | grep -o '"qrCodeImage":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
PAYMENT_LINK=$(echo "$CREATE_SIMPLE_CHARGE" | grep -o '"paymentLinkUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [ -n "$QR_CODE_URL" ]; then
  echo -e "${GREEN}QR Code gerado: $QR_CODE_URL${NC}"
  echo -e "${GREEN}Link de pagamento: $PAYMENT_LINK${NC}"
fi
echo

echo -e "${BLUE}===== TESTE CONCLUÍDO =====${NC}"
