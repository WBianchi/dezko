/*
  Warnings:

  - The values [CARTAO_CREDITO] on the enum `FormaDePagamento` will be removed. If these variants are still used in the database, this will fail.
  - The values [REEMBOLSADO,CONCLUIDO] on the enum `StatusDoPedido` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `telefone` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `amenidades` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `cnpj` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `fotos` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `preco` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `lida` on the `Mensagem` table. All the data in the column will be lost.
  - You are about to drop the column `statusAgendamento` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FormaDePagamento_new" AS ENUM ('PIX', 'CARTAO', 'BOLETO');
ALTER TABLE "Pedido" ALTER COLUMN "formaPagamento" TYPE "FormaDePagamento_new" USING ("formaPagamento"::text::"FormaDePagamento_new");
ALTER TYPE "FormaDePagamento" RENAME TO "FormaDePagamento_old";
ALTER TYPE "FormaDePagamento_new" RENAME TO "FormaDePagamento";
DROP TYPE "FormaDePagamento_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatusDoPedido_new" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');
ALTER TABLE "Pedido" ALTER COLUMN "statusPedido" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "statusPedido" TYPE "StatusDoPedido_new" USING ("statusPedido"::text::"StatusDoPedido_new");
ALTER TYPE "StatusDoPedido" RENAME TO "StatusDoPedido_old";
ALTER TYPE "StatusDoPedido_new" RENAME TO "StatusDoPedido";
DROP TYPE "StatusDoPedido_old";
ALTER TABLE "Pedido" ALTER COLUMN "statusPedido" SET DEFAULT 'PENDENTE';
COMMIT;

-- DropIndex
DROP INDEX "Espaco_cnpj_key";

-- DropIndex
DROP INDEX "Usuario_cpf_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "telefone";

-- AlterTable
ALTER TABLE "Espaco" DROP COLUMN "amenidades",
DROP COLUMN "categoria",
DROP COLUMN "cnpj",
DROP COLUMN "fotos",
DROP COLUMN "preco",
DROP COLUMN "telefone",
ALTER COLUMN "endereco" DROP NOT NULL,
ALTER COLUMN "cidade" DROP NOT NULL,
ALTER COLUMN "estado" DROP NOT NULL,
ALTER COLUMN "bairro" DROP NOT NULL,
ALTER COLUMN "cep" DROP NOT NULL,
ALTER COLUMN "numero" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Mensagem" DROP COLUMN "lida";

-- AlterTable
ALTER TABLE "Pedido" DROP COLUMN "statusAgendamento",
ALTER COLUMN "formaPagamento" SET DEFAULT 'PIX';

-- AlterTable
ALTER TABLE "Plano" ALTER COLUMN "descricao" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "cpf",
DROP COLUMN "telefone";

-- DropEnum
DROP TYPE "StatusDoAgendamento";
