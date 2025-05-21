-- Adiciona campos importantes e arquivada para mensagens
ALTER TABLE "Mensagem" ADD COLUMN IF NOT EXISTS "importante" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Mensagem" ADD COLUMN IF NOT EXISTS "arquivada" BOOLEAN NOT NULL DEFAULT false;
