/*
  Warnings:

  - A unique constraint covering the columns `[tipo]` on the table `Configuracao` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Configuracao" ALTER COLUMN "nomeSite" DROP NOT NULL,
ALTER COLUMN "descricaoSite" DROP NOT NULL,
ALTER COLUMN "emailContato" DROP NOT NULL,
ALTER COLUMN "telefoneContato" DROP NOT NULL,
ALTER COLUMN "enderecoEmpresa" DROP NOT NULL,
ALTER COLUMN "tipo" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Configuracao_tipo_key" ON "Configuracao"("tipo");
