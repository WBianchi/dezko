-- Remover colunas antigas da tabela Agenda
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "categoria";
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "adicionais";
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "vantagens";
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "beneficios";
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "fotoPrincipal";
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "fotoCapa";
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "galeria";
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "cidade";
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "estado";
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "endereco";
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "telefone";
ALTER TABLE "Agenda" DROP COLUMN IF EXISTS "responsavel";
