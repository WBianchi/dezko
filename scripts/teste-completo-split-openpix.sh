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
SUBCONTA_PIX="teste@email.com"
echo -e "${AZUL}Usando subconta: $SUBCONTA_NOME (ID: $SUBCONTA_ID)${RESET}"

# Gerar ID de transação único
TRANSACTION_ID="teste_completo_$(date +%s)"
echo -e "${AZUL}ID da transação: $TRANSACTION_ID${RESET}"

# Valores para o split (em centavos)
VALOR_TOTAL=200  # R$ 2,00
VALOR_SUBCONTA=140  # R$ 1,40 (70%)
VALOR_PRINCIPAL=60  # R$ 0,60 (30%)

echo -e "${AZUL}Valor total: R$ $(echo "scale=2; $VALOR_TOTAL/100" | bc)${RESET}"
echo -e "${AZUL}Valor subconta: R$ $(echo "scale=2; $VALOR_SUBCONTA/100" | bc) (70%)${RESET}"
echo -e "${AZUL}Valor principal: R$ $(echo "scale=2; $VALOR_PRINCIPAL/100" | bc) (30%)${RESET}"

echo -e "\n${VERDE}=== ETAPA 1: Criando cobrança PIX com split ===${RESET}"
echo -e "${AZUL}Criando cobrança PIX com split para $SUBCONTA_NOME...${RESET}"

response=$(curl -s -X POST \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"correlationID\": \"$TRANSACTION_ID\",
    \"value\": $VALOR_TOTAL,
    \"comment\": \"Teste completo de split - R\$ 2,00\",
    \"expiresIn\": 3600,
    \"customer\": {
      \"name\": \"Cliente Teste\",
      \"email\": \"cliente@teste.com\",
      \"phone\": \"11999999999\"
    },
    \"destinationSplits\": [
      {
        \"destination\": \"$SUBCONTA_ID\",
        \"pixKey\": \"$SUBCONTA_PIX\",
        \"value\": $VALOR_SUBCONTA
      }
    ]
  }" \
  https://api.openpix.com.br/api/v1/charge)

echo -e "${AMARELO}Resposta da API:${RESET}"
echo "$response" | jq . 2>/dev/null || echo "$response"

# Extrair informações importantes da resposta
CHARGE_ID=$(echo "$response" | grep -o '\"id\":\"[^\"]*\"' | head -1 | cut -d ':' -f2 | tr -d '\"' || echo "")
TRANSACTION_ID_RESPONSE=$(echo "$response" | grep -o '\"transactionID\":\"[^\"]*\"' | head -1 | cut -d ':' -f2 | tr -d '\"' || echo "")
BR_CODE=$(echo "$response" | grep -o '\"brCode\":\"[^\"]*\"' | head -1 | cut -d ':' -f2 | tr -d '\"' || echo "")

if [ -z "$CHARGE_ID" ] && [ -n "$TRANSACTION_ID_RESPONSE" ]; then
  CHARGE_ID=$TRANSACTION_ID_RESPONSE
fi

if [ -z "$CHARGE_ID" ]; then
  echo -e "${VERMELHO}Erro: Não foi possível criar a cobrança PIX${RESET}"
  exit 1
fi

echo -e "\n${VERDE}Cobrança criada com sucesso!${RESET}"
echo -e "${AZUL}ID da cobrança: $CHARGE_ID${RESET}"
echo -e "${AZUL}BR Code (Copia e Cola PIX): ${BR_CODE:0:30}...${RESET}"

echo -e "\n${AMARELO}POR FAVOR, FAÇA O PAGAMENTO PIX USANDO O CÓDIGO ACIMA${RESET}"
echo -e "${AMARELO}Após o pagamento, pressione ENTER para continuar...${RESET}"
read -p ""

echo -e "\n${VERDE}=== ETAPA 2: Verificando status do pagamento ===${RESET}"
echo -e "${AZUL}Consultando status da cobrança $CHARGE_ID...${RESET}"

max_attempts=5
attempt=1
payment_confirmed=false

while [ $attempt -le $max_attempts ] && [ "$payment_confirmed" = false ]; do
  echo -e "${AZUL}Tentativa $attempt de $max_attempts...${RESET}"
  
  charge_status=$(curl -s -X GET \
    -H "Authorization: $OPENPIX_AUTH_KEY" \
    -H "Content-Type: application/json" \
    "https://api.openpix.com.br/api/v1/charge/$CHARGE_ID")
  
  echo "$charge_status" | grep -q "\"status\":\"COMPLETED\"" && payment_confirmed=true
  echo "$charge_status" | grep -q "\"status\":\"CONFIRMED\"" && payment_confirmed=true
  echo "$charge_status" | grep -q "\"status\":\"RECEIVED\"" && payment_confirmed=true
  echo "$charge_status" | grep -q "\"status\":\"PAID\"" && payment_confirmed=true
  
  if [ "$payment_confirmed" = true ]; then
    echo -e "${VERDE}Pagamento confirmado!${RESET}"
    echo "$charge_status" | jq . 2>/dev/null || echo "$charge_status"
  else
    echo -e "${AMARELO}Pagamento ainda não confirmado. Aguardando 5 segundos...${RESET}"
    sleep 5
    attempt=$((attempt+1))
  fi
done

if [ "$payment_confirmed" = false ]; then
  echo -e "${VERMELHO}Pagamento não confirmado após $max_attempts tentativas.${RESET}"
  echo -e "${AMARELO}Verifique no painel da OpenPIX se o pagamento foi recebido.${RESET}"
  exit 1
fi

echo -e "\n${VERDE}=== ETAPA 3: Verificando saldo da subconta ===${RESET}"
echo -e "${AZUL}Consultando saldo da subconta $SUBCONTA_ID...${RESET}"

subaccount_balance=$(curl -s -X GET \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  "https://api.openpix.com.br/api/v1/subaccount/$SUBCONTA_ID")

echo -e "${AMARELO}Resposta da API:${RESET}"
echo "$subaccount_balance" | jq . 2>/dev/null || echo "$subaccount_balance"

echo -e "\n${VERDE}=== TESTE COMPLETO ===${RESET}"
echo -e "${AZUL}O teste de integração foi finalizado.${RESET}"
echo -e "${AZUL}Verifique no painel da OpenPIX se:${RESET}"
echo -e "  ${AZUL}1. O pagamento foi recebido${RESET}"
echo -e "  ${AZUL}2. O valor foi dividido conforme configurado (70% para a subconta)${RESET}"
echo -e "  ${AZUL}3. A subconta '$SUBCONTA_NOME' recebeu R\$ $(echo "scale=2; $VALOR_SUBCONTA/100" | bc)${RESET}"

echo -e "\n${VERDE}Obrigado por testar a integração!${RESET}"
