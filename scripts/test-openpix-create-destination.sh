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

# Dados para criar uma subconta de teste
ESPACO_ID="test_$(date +%s)"  # ID único baseado no timestamp
ESPACO_NOME="Espaço Teste $(date +%H:%M:%S)"
PIX_KEY="teste@email.com"       # Chave PIX de exemplo

echo "Criando subconta para: $ESPACO_NOME"

# Fazer a chamada para a API da OpenPIX para criar uma subconta
echo "Chamando API: https://api.openpix.com.br/api/v1/subaccount"

response=$(curl -s -X POST \
  -H "Authorization: $OPENPIX_AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$ESPACO_NOME\",
    \"pixKey\": \"$PIX_KEY\",
    \"document\": \"12345678909\",
    \"documentType\": \"CPF\",
    \"taxID\": \"12345678909\",
    \"description\": \"Subconta criada via API para teste\"
  }" \
  https://api.openpix.com.br/api/v1/subaccount)

echo "Resposta da API:"
echo "$response" | jq . 2>/dev/null || echo "$response"

# Extrair o ID da resposta (se tiver sido bem-sucedido)
DESTINATION_ID=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d '"' -f4)

if [ ! -z "$DESTINATION_ID" ]; then
  echo "\nSubconta criada com sucesso! ID: $DESTINATION_ID"
  echo "Este ID deve ser armazenado como 'openPixWalletId' para o espaço correspondente."
else
  echo "\nNão foi possível extrair o ID da resposta. Verifique se a chamada foi bem-sucedida."
fi
