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

echo -e "${BLUE}===== TESTE DE API DA OPENPIX =====${NC}"
echo -e "${BLUE}URL Base: $API_BASE_URL${NC}"
echo -e "${BLUE}Client ID: $CLIENT_ID${NC}"
echo

# 1. Teste de autenticação (listar carteiras)
echo -e "${BLUE}1. Testando autenticação (listando carteiras)...${NC}"
WALLETS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/wallet" \
  -H "Authorization: $AUTH_KEY" \
  -H "Content-Type: application/json")

# Verificar se a resposta contém o campo "items"
if echo "$WALLETS_RESPONSE" | grep -q "items"; then
  echo -e "${GREEN}✓ Autenticação bem-sucedida!${NC}"
  echo -e "Resposta:\n$(echo "$WALLETS_RESPONSE" | jq -r '.' 2>/dev/null || echo "$WALLETS_RESPONSE")"
else
  echo -e "${RED}✗ Falha na autenticação ou listagem de carteiras${NC}"
  echo -e "Resposta:\n$(echo "$WALLETS_RESPONSE" | jq -r '.' 2>/dev/null || echo "$WALLETS_RESPONSE")"
fi
echo

# 2. Listar subcontas existentes
echo -e "${BLUE}2. Listando subcontas existentes...${NC}"
SUBACCOUNTS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/subaccount" \
  -H "Authorization: $AUTH_KEY" \
  -H "Content-Type: application/json")

# Verificar a resposta
if echo "$SUBACCOUNTS_RESPONSE" | grep -q "items"; then
  echo -e "${GREEN}✓ Listagem de subcontas bem-sucedida!${NC}"
  echo -e "Resposta:\n$(echo "$SUBACCOUNTS_RESPONSE" | jq -r '.' 2>/dev/null || echo "$SUBACCOUNTS_RESPONSE")"
else
  echo -e "${RED}✗ Falha na listagem de subcontas${NC}"
  echo -e "Resposta:\n$(echo "$SUBACCOUNTS_RESPONSE" | jq -r '.' 2>/dev/null || echo "$SUBACCOUNTS_RESPONSE")"
fi
echo

# 3. Criar uma subconta de teste
echo -e "${BLUE}3. Criando uma subconta de teste...${NC}"

# Gerar nome e email únicos
TEST_NAME="Lojista Teste $(date +%s)"
TEST_EMAIL="lojista_$(date +%s)@dezko.com.br"

CREATE_SUBACCOUNT_RESPONSE=$(curl -s -X POST "$API_BASE_URL/subaccount" \
  -H "Authorization: $AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"taxID\": \"12345678901\",
    \"email\": \"$TEST_EMAIL\"
  }")

# Extrair o ID da subconta (se foi criada com sucesso)
SUBACCOUNT_ID=$(echo "$CREATE_SUBACCOUNT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$SUBACCOUNT_ID" ]; then
  echo -e "${GREEN}✓ Subconta criada com sucesso! ID: $SUBACCOUNT_ID${NC}"
  echo -e "Resposta:\n$(echo "$CREATE_SUBACCOUNT_RESPONSE" | jq -r '.' 2>/dev/null || echo "$CREATE_SUBACCOUNT_RESPONSE")"
  
  # Armazenar o ID para uso posterior
  echo "export SUBACCOUNT_ID=$SUBACCOUNT_ID" > /tmp/openpix_test_subaccount
else
  echo -e "${RED}✗ Falha na criação da subconta${NC}"
  echo -e "Resposta:\n$(echo "$CREATE_SUBACCOUNT_RESPONSE" | jq -r '.' 2>/dev/null || echo "$CREATE_SUBACCOUNT_RESPONSE")"
fi
echo

# 4. Criar uma cobrança de teste para a subconta (se tiver sido criada com sucesso)
if [ -n "$SUBACCOUNT_ID" ]; then
  echo -e "${BLUE}4. Criando uma cobrança de teste para a subconta...${NC}"
  
  CREATE_CHARGE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/charge" \
    -H "Authorization: $AUTH_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"correlationID\": \"dezko-test-$(date +%s)\",
      \"value\": 1000,
      \"comment\": \"Teste de cobrança via API\",
      \"subaccounts\": [
        {
          \"destination\": \"$SUBACCOUNT_ID\",
          \"percentage\": 90
        }
      ]
    }")
  
  # Verificar se a cobrança foi criada com sucesso
  CHARGE_ID=$(echo "$CREATE_CHARGE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -n "$CHARGE_ID" ]; then
    echo -e "${GREEN}✓ Cobrança criada com sucesso! ID: $CHARGE_ID${NC}"
    echo -e "Resposta:\n$(echo "$CREATE_CHARGE_RESPONSE" | jq -r '.' 2>/dev/null || echo "$CREATE_CHARGE_RESPONSE")"
    
    # QR Code URL (se disponível)
    QR_CODE_URL=$(echo "$CREATE_CHARGE_RESPONSE" | grep -o '"qrCodeImage":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$QR_CODE_URL" ]; then
      echo -e "${GREEN}✓ QR Code disponível: $QR_CODE_URL${NC}"
    fi
  else
    echo -e "${RED}✗ Falha na criação da cobrança${NC}"
    echo -e "Resposta:\n$(echo "$CREATE_CHARGE_RESPONSE" | jq -r '.' 2>/dev/null || echo "$CREATE_CHARGE_RESPONSE")"
  fi
fi
echo

echo -e "${BLUE}===== TESTE CONCLUÍDO =====${NC}"
