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

echo -e "${BLUE}===== TESTE DE SPLIT DE PAGAMENTO OPENPIX =====${NC}"
echo -e "${BLUE}URL Base: $API_BASE_URL${NC}"
echo -e "${BLUE}Client ID: $CLIENT_ID${NC}"
echo

# 1. Criar um cliente de teste (destinatário do split)
echo -e "${BLUE}1. Criando cliente de teste (destinatário do split)...${NC}"

# Gerar nome e email únicos para evitar duplicações
TIMESTAMP=$(date +%s)
CUSTOMER_NAME="Lojista Teste $TIMESTAMP"
CUSTOMER_EMAIL="lojista${TIMESTAMP}@teste.com"
CUSTOMER_PHONE="+5511999999999"
CUSTOMER_TAXID="12345678901"
CORRELATION_ID="customer-$TIMESTAMP"

CREATE_CUSTOMER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/customer" \
  -H "Authorization: $AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$CUSTOMER_NAME\",
    \"email\": \"$CUSTOMER_EMAIL\",
    \"phone\": \"$CUSTOMER_PHONE\",
    \"taxID\": {
      \"taxID\": \"$CUSTOMER_TAXID\",
      \"type\": \"BR:CPF\"
    },
    \"correlationID\": \"$CORRELATION_ID\"
  }")

echo -e "Resposta criação cliente:\n$(echo "$CREATE_CUSTOMER_RESPONSE" | jq -r '.' 2>/dev/null || echo "$CREATE_CUSTOMER_RESPONSE")"
echo

# Extrair o ID do cliente
CUSTOMER_ID=$(echo "$CREATE_CUSTOMER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [ -z "$CUSTOMER_ID" ]; then
  # Tentar extrair de forma alternativa
  CUSTOMER_ID=$(echo "$CREATE_CUSTOMER_RESPONSE" | grep -o '"correlationID":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
fi

echo -e "${BLUE}ID do Cliente: $CUSTOMER_ID${NC}"
echo

# 2. Criar uma cobrança com split para o cliente criado
echo -e "${BLUE}2. Criando cobrança com split (90% para o lojista, 10% para a plataforma)...${NC}"

# Criar correlationID único para a cobrança
CHARGE_CORRELATION_ID="dezko-split-$TIMESTAMP"

CREATE_SPLIT_CHARGE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/charge" \
  -H "Authorization: $AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"correlationID\": \"$CHARGE_CORRELATION_ID\",
    \"value\": 1000,
    \"comment\": \"Teste de cobrança com split via API\",
    \"customer\": {
      \"name\": \"$CUSTOMER_NAME\",
      \"email\": \"$CUSTOMER_EMAIL\",
      \"phone\": \"$CUSTOMER_PHONE\",
      \"taxID\": {
        \"taxID\": \"$CUSTOMER_TAXID\",
        \"type\": \"BR:CPF\"
      },
      \"correlationID\": \"$CORRELATION_ID\"
    },
    \"splits\": [
      {
        \"pixKey\": \"425c00e0-e5bc-478d-a95a-0d86e7c67015\",
        \"splitValue\": 900
      }
    ]
  }")

echo -e "Resposta criação de cobrança com split:\n$(echo "$CREATE_SPLIT_CHARGE_RESPONSE" | jq -r '.' 2>/dev/null || echo "$CREATE_SPLIT_CHARGE_RESPONSE")"
echo

# Extrair informações da cobrança
CHARGE_ID=$(echo "$CREATE_SPLIT_CHARGE_RESPONSE" | grep -o '"identifier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
QR_CODE_URL=$(echo "$CREATE_SPLIT_CHARGE_RESPONSE" | grep -o '"qrCodeImage":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
PAYMENT_LINK=$(echo "$CREATE_SPLIT_CHARGE_RESPONSE" | grep -o '"paymentLinkUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [ -n "$CHARGE_ID" ]; then
  echo -e "${GREEN}Cobrança com split criada com sucesso!${NC}"
  echo -e "ID da Cobrança: $CHARGE_ID"
  echo -e "QR Code URL: $QR_CODE_URL"
  echo -e "Link de Pagamento: $PAYMENT_LINK"
else
  echo -e "${RED}Falha ao criar cobrança com split${NC}"
fi
echo

echo -e "${BLUE}===== TESTE CONCLUÍDO =====${NC}"
echo -e "${GREEN}Para testar este QR Code no seu celular, acesse: $PAYMENT_LINK${NC}"
