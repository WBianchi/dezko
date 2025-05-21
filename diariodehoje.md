Deixa eu contetualizar pra voce

Tenho um marketplace, onde eu sou o admin e gerencio os espacos 

os espacos assinam um plano e podem gerenciam as agendas, reservas, clientes

e o cliente consegue pagar a reserva pro espaco

E cada espaco tem sua pagina pra poder servir sua agenda pro usuario pagar, todo fluxo ja esta redondo, mas o cliente desistiu do mercado pago, optou por usar a openpix pra pix e o stripe pra cartao entao eu quero fazer o split e as configuracoes

Entao o cliente acessa a pagina do espaco por exemplo
http://localhost:3000/espaco/coworking-central

Ai ele clica no `Reservar agora`nesse componente de agendendamento-espaco
/Users/willian/Documents/Dezko/dezko/src/components/espaco/agendamento-espaco.tsx

Ai ele abre o /Users/willian/Documents/Dezko/dezko/src/components/espaco/modal-selecao-pagamento.tsx 
E ele escolhe se quer pagar com pix ou cartao
Ai baseado na escolha abre esse /Users/willian/Documents/Dezko/dezko/src/components/espaco/modal-pagamento.tsx ou esse /Users/willian/Documents/Dezko/dezko/src/components/espaco/modal-pagamento-pix.tsx

.env

STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=we_1R4sw5RooBJuvFS923HzyL9I





/Users/willian/Documents/Dezko/dezko/prisma/schema.prisma


Aqui e onde o admin configuraria as regras do split
/Users/willian/Documents/Dezko/dezko/src/app/dashboard/admin/split


Aqui e o espaco configuraria as regras do pagamento como integrar a conta com openpix e o stripe via auth2
/Users/willian/Documents/Dezko/dezko/src/app/dashboard/espaco/config-pagamentos/page.tsx


Entao agora como nao vamos usar mais o mercado pago, pensei em comecar do zero

1 - Integrar conta do lojista com o stripe ja que ja temos a do admin integrado no .env



