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

# Listar todas as subcontas
echo "Listando subcontas existentes..."

response=$(curl -s -X GET \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  https://api.openpix.com.br/api/v1/subaccount)

echo "Resposta da API:"
echo "$response" | jq . 2>/dev/null || echo "$response"

# Contar o número de subcontas (se possível)
if echo "$response" | grep -q "subAccounts"; then
  COUNT=$(echo "$response" | grep -o '"subAccounts":\[.*\]' | grep -o "\[.*\]" | grep -o "{" | wc -l)
  echo -e "\nForam encontradas aproximadamente $COUNT subcontas."
fi
