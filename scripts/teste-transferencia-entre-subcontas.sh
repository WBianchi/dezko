#!/bin/bash

# Cores para melhor visualização
VERDE='\033[0;32m'
AZUL='\033[0;34m'
AMARELO='\033[0;33m'
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

# Dados das subcontas
SUBCONTA_ID="10644290927"
SUBCONTA_NOME="Helio Lopes"
SUBCONTA_PIXKEY="10644290927"

OUTRA_SUBCONTA_ID="teste@email.com"
OUTRA_SUBCONTA_NOME="Espaço Teste 21:38:03"
OUTRA_SUBCONTA_PIXKEY="teste@email.com"

echo -e "${AZUL}Origem: Conta Principal${RESET}"
echo -e "${AZUL}Destino: $SUBCONTA_NOME (PIX Key: $SUBCONTA_PIXKEY)${RESET}"

# Valor de transferência
VALOR=100 # R$ 1,00
echo -e "${AZUL}Valor a transferir: R$ $(echo "scale=2; $VALOR/100" | bc)${RESET}"

echo -e "\n${VERDE}=== TESTE 1: Transferência da conta principal para subconta ===${RESET}"
echo -e "${AZUL}POST /api/v1/transfer${RESET}"

response=$(curl -s -X POST \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"value\": $VALOR,
    \"comment\": \"Transferência para subconta - Teste\",
    \"sender\": {
      \"account\": \"main\"
    },
    \"receiver\": {
      \"pixKey\": \"$SUBCONTA_PIXKEY\"
    }
  }" \
  "https://api.openpix.com.br/api/v1/transfer")

echo -e "${AMARELO}Resposta:${RESET}"
echo "$response" | jq . 2>/dev/null || echo "$response"

echo -e "\n${VERDE}=== TESTE 2: Transferência entre subcontas ===${RESET}"
echo -e "${AZUL}POST /api/v1/subaccount/transfer${RESET}"

subaccount_transfer_response=$(curl -s -X POST \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"value\": $VALOR,
    \"comment\": \"Transferência entre subcontas - Teste\",
    \"sender\": {
      \"pixKey\": \"$SUBCONTA_PIXKEY\"
    },
    \"receiver\": {
      \"pixKey\": \"$OUTRA_SUBCONTA_PIXKEY\"
    }
  }" \
  "https://api.openpix.com.br/api/v1/subaccount/transfer")

echo -e "${AMARELO}Resposta:${RESET}"
echo "$subaccount_transfer_response" | jq . 2>/dev/null || echo "$subaccount_transfer_response"

echo -e "\n${VERDE}=== TESTE 3: Consultando saldo da subconta ===${RESET}"
echo -e "${AZUL}GET /api/v1/subaccount?pixKey=$SUBCONTA_PIXKEY${RESET}"

balance_response=$(curl -s -X GET \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  "https://api.openpix.com.br/api/v1/subaccount?pixKey=$SUBCONTA_PIXKEY")

echo -e "${AMARELO}Resposta:${RESET}"
echo "$balance_response" | jq . 2>/dev/null || echo "$balance_response"

echo -e "\n${VERDE}=== TESTE COMPLETO ===${RESET}"
echo -e "${AZUL}Os testes de transferência foram concluídos.${RESET}"
echo -e "${AZUL}Verifique as respostas para determinar se as funcionalidades estão disponíveis para sua conta.${RESET}"
