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

echo -e "${BLUE}===== TESTE SIMPLES DA API OPENPIX =====${NC}"
echo -e "${BLUE}URL Base: $API_BASE_URL${NC}"
echo -e "${BLUE}Client ID: $CLIENT_ID${NC}"
echo

# 1. Testar a criação de uma cobrança simples (sem split)
echo -e "${BLUE}1. Criando uma cobrança simples...${NC}"

CREATE_CHARGE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/charge" \
  -H "Authorization: $AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"correlationID\": \"dezko-test-$(date +%s)\",
    \"value\": 1000,
    \"comment\": \"Teste de cobrança via API\"
  }")

echo -e "Resposta da criação de cobrança:\n$(echo "$CREATE_CHARGE_RESPONSE" | jq -r '.' 2>/dev/null || echo "$CREATE_CHARGE_RESPONSE")"
echo

# 2. Testar a listagem de cobranças
echo -e "${BLUE}2. Listando cobranças recentes...${NC}"

LIST_CHARGES_RESPONSE=$(curl -s -X GET "$API_BASE_URL/charge" \
  -H "Authorization: $AUTH_KEY" \
  -H "Content-Type: application/json")

echo -e "Resposta da listagem de cobranças:\n$(echo "$LIST_CHARGES_RESPONSE" | jq -r '.' 2>/dev/null || echo "$LIST_CHARGES_RESPONSE")"
echo

# 3. Tentar obter informações sobre o cliente/conta
echo -e "${BLUE}3. Obtendo informações da conta...${NC}"

ACCOUNT_INFO_RESPONSE=$(curl -s -X GET "$API_BASE_URL/company" \
  -H "Authorization: $AUTH_KEY" \
  -H "Content-Type: application/json")

echo -e "Resposta das informações da conta:\n$(echo "$ACCOUNT_INFO_RESPONSE" | jq -r '.' 2>/dev/null || echo "$ACCOUNT_INFO_RESPONSE")"
echo

echo -e "${BLUE}===== TESTE CONCLUÍDO =====${NC}"
