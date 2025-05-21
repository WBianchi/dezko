#!/bin/bash

# Extrair a chave de autenticação do arquivo .env
OPENPIX_AUTH_KEY=$(grep OPENPIX_AUTH_KEY .env | cut -d "=" -f2)

# Verificar se a chave foi encontrada
if [ -z "$OPENPIX_AUTH_KEY" ]; then
  echo "Erro: OPENPIX_AUTH_KEY não encontrada no arquivo .env"
  exit 1
fi

# Remover quaisquer aspas da chave
OPENPIX_AUTH_KEY=$(echo $OPENPIX_AUTH_KEY | tr -d '"')
echo "Usando chave OpenPIX: ${OPENPIX_AUTH_KEY:0:10}..."

# ID da subconta que vimos na interface
SUBCONTA_ID="10644290927"
# Chave PIX associada à subconta
PIX_KEY="teste@email.com"  # Use a chave PIX real da subconta
echo "Usando subconta com ID: $SUBCONTA_ID e chave PIX: $PIX_KEY"

# Gerar ID de transação único
TRANSACTION_ID="test_$(date +%s)"
echo "ID da transação: $TRANSACTION_ID"

# Valores para o split (em centavos)
VALOR_TOTAL=1000  # R$ 10,00
VALOR_SUBCONTA=700  # R$ 7,00 (70%)
VALOR_PRINCIPAL=300  # R$ 3,00 (30%)

echo "Valor total: R$ $(echo "scale=2; $VALOR_TOTAL/100" | bc)"
echo "Valor subconta: R$ $(echo "scale=2; $VALOR_SUBCONTA/100" | bc) (70%)"
echo "Valor principal: R$ $(echo "scale=2; $VALOR_PRINCIPAL/100" | bc) (30%)"

# Criar uma cobrança com split
echo "Criando cobrança PIX com split usando walletId E pixKey..."

response=$(curl -s -X POST \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"correlationID\": \"$TRANSACTION_ID\",
    \"value\": $VALOR_TOTAL,
    \"comment\": \"Teste de cobrança com split\",
    \"expiresIn\": 3600,
    \"type\": \"DYNAMIC\",
    \"customer\": {
      \"name\": \"Cliente Teste\",
      \"email\": \"cliente@teste.com\",
      \"phone\": \"11999999999\"
    },
    \"splits\": [
      {
        \"walletId\": \"$SUBCONTA_ID\",
        \"pixKey\": \"$PIX_KEY\",
        \"value\": $VALOR_SUBCONTA
      }
    ]
  }" \
  https://api.openpix.com.br/api/v1/charge)

echo "Resposta da API:"
echo "$response" | jq . 2>/dev/null || echo "$response"

# Extrair informações importantes da resposta
CHARGE_ID=$(echo "$response" | grep -o '\"id\":\"[^\"]*\"' | head -1 | cut -d ':' -f2 | tr -d '\"' || echo "Não encontrado")
BR_CODE=$(echo "$response" | grep -o '\"brCode\":\"[^\"]*\"' | head -1 | cut -d ':' -f2 | tr -d '\"' || echo "Não encontrado")

echo -e "\nID da cobrança: $CHARGE_ID"
echo "BR Code (Copia e Cola PIX): ${BR_CODE:0:20}..."
echo
echo "Para testar o pagamento, use o BR Code acima em qualquer banco"
echo "Após o pagamento, verifique no painel da OpenPIX se o valor foi dividido conforme configurado"
