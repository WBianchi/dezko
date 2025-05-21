#!/bin/bash

# Cores para melhor visualização
VERDE='\033[0;32m'
AMARELO='\033[0;33m'
AZUL='\033[0;34m'
VERMELHO='\033[0;31m'
RESET='\033[0m'

# Extrair a chave de autenticação do arquivo .env
OPENPIX_AUTH_KEY=$(grep OPENPIX_AUTH_KEY .env | cut -d "=" -f2)

# Verificar se a chave foi encontrada
if [ -z "$OPENPIX_AUTH_KEY" ]; then
  echo -e "${VERMELHO}Erro: OPENPIX_AUTH_KEY não encontrada no arquivo .env${RESET}"
  exit 1
fi

# Remover quaisquer aspas da chave
OPENPIX_AUTH_KEY=$(echo $OPENPIX_AUTH_KEY | tr -d '"')
echo -e "${AZUL}Usando chave OpenPIX: ${OPENPIX_AUTH_KEY:0:10}...${RESET}"

# Dados da subconta
SUBCONTA_ID="10644290927"
SUBCONTA_NOME="Helio Lopes"
echo -e "${AZUL}Referência subconta: $SUBCONTA_NOME (ID: $SUBCONTA_ID)${RESET}"

echo -e "\n${VERDE}=== TESTE 1: Obter informações da conta principal ===${RESET}"
echo -e "${AZUL}GET /api/v1/account/${RESET}"

account_response=$(curl -s -X GET \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  "https://api.openpix.com.br/api/v1/account/")

echo -e "${AMARELO}Resposta:${RESET}"
echo "$account_response" | jq . 2>/dev/null || echo "$account_response"

echo -e "\n${VERDE}=== TESTE 2: Tentar obter lista de subcontas ===${RESET}"
echo -e "${AZUL}GET /api/v1/subaccount${RESET}"

subaccounts_response=$(curl -s -X GET \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  "https://api.openpix.com.br/api/v1/subaccount")

echo -e "${AMARELO}Resposta:${RESET}"
echo "$subaccounts_response" | jq . 2>/dev/null || echo "$subaccounts_response"

echo -e "\n${VERDE}=== TESTE 3: Tentar retirar saldo da subconta ===${RESET}"
echo -e "${AZUL}POST /api/v1/subaccount/$SUBCONTA_ID/withdraw${RESET}"

withdraw_response=$(curl -s -X POST \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"value\": 10,
    \"comment\": \"Teste de retirada de saldo\"
  }" \
  "https://api.openpix.com.br/api/v1/subaccount/$SUBCONTA_ID/withdraw")

echo -e "${AMARELO}Resposta:${RESET}"
echo "$withdraw_response" | jq . 2>/dev/null || echo "$withdraw_response"

echo -e "\n${VERDE}=== TESTE 4: Tentar fazer uma transferência entre contas ===${RESET}"
echo -e "${AZUL}POST /api/v1/transfer${RESET}"

transfer_response=$(curl -s -X POST \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"value\": 100,
    \"comment\": \"Teste de transferência entre contas\",
    \"sender\": {
      \"account\": \"main\"
    },
    \"receiver\": {
      \"pixKey\": \"teste@email.com\"
    }
  }" \
  "https://api.openpix.com.br/api/v1/transfer")

echo -e "${AMARELO}Resposta:${RESET}"
echo "$transfer_response" | jq . 2>/dev/null || echo "$transfer_response"

echo -e "\n${VERDE}=== TESTE COMPLETO ===${RESET}"
echo -e "${AZUL}Os testes das APIs avançadas foram concluídos.${RESET}"
echo -e "${AZUL}Analise as respostas para verificar quais funcionalidades estão disponíveis em sua conta.${RESET}"
echo -e "${AZUL}Funcionalidades marcadas com (request access) na documentação geralmente requerem permissões especiais.${RESET}"
