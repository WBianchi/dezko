/*
  Warnings:

  - You are about to drop the column `createdAt` on the `CategoriaEspaco` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `CategoriaEspaco` table. All the data in the column will be lost.
  - You are about to drop the column `icone` on the `CategoriaEspaco` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CategoriaEspaco` table. All the data in the column will be lost.
  - You are about to drop the column `adicionais` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `beneficios` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `capacidade` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `categoriaId` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `complemento` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `fotoCapa` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `fotoPrincipal` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `horarioAbertura` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `horarioFechamento` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `mercadoPagoTokenExpires` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `vantagens` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `SpaceCommission` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `SpaceCommission` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `SpaceCommission` table. All the data in the column will be lost.
  - You are about to drop the `AdminConfig` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `adminId` to the `Espaco` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Espaco" DROP CONSTRAINT "Espaco_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "Espaco" DROP CONSTRAINT "Espaco_userId_fkey";

-- DropIndex
DROP INDEX "Espaco_categoriaId_idx";

-- DropIndex
DROP INDEX "Espaco_email_key";

-- DropIndex
DROP INDEX "Espaco_userId_idx";

-- DropIndex
DROP INDEX "SpaceCommission_spaceId_idx";

-- AlterTable
ALTER TABLE "CategoriaEspaco" DROP COLUMN "createdAt",
DROP COLUMN "descricao",
DROP COLUMN "icone",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Espaco" DROP COLUMN "adicionais",
DROP COLUMN "beneficios",
DROP COLUMN "capacidade",
DROP COLUMN "categoriaId",
DROP COLUMN "complemento",
DROP COLUMN "fotoCapa",
DROP COLUMN "fotoPrincipal",
DROP COLUMN "horarioAbertura",
DROP COLUMN "horarioFechamento",
DROP COLUMN "mercadoPagoTokenExpires",
DROP COLUMN "numero",
DROP COLUMN "senha",
DROP COLUMN "userId",
DROP COLUMN "valor",
DROP COLUMN "vantagens",
ALTER COLUMN "endereco" DROP NOT NULL,
ALTER COLUMN "cidade" DROP NOT NULL,
ALTER COLUMN "estado" DROP NOT NULL,
ALTER COLUMN "descricao" DROP NOT NULL,
ALTER COLUMN "bairro" DROP NOT NULL,
ALTER COLUMN "bairro" DROP DEFAULT,
ALTER COLUMN "cep" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SpaceCommission" DROP COLUMN "active",
DROP COLUMN "endDate",
DROP COLUMN "startDate";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "telefone" TEXT;

-- DropTable
DROP TABLE "AdminConfig";

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EspacoUsuario" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EspacoUsuario_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EspacoCategoria" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EspacoCategoria_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");

-- CreateIndex
CREATE INDEX "_EspacoUsuario_B_index" ON "_EspacoUsuario"("B");

-- CreateIndex
CREATE INDEX "_EspacoCategoria_B_index" ON "_EspacoCategoria"("B");

-- Criar admin padrão se não existir
INSERT INTO "Admin" (id, nome, email, senha, "createdAt", "updatedAt")
SELECT 
  'admin_default', 
  'Admin Padrão', 
  'admin@dezko.com.br',
  '$2a$10$YourHashedPasswordHere',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Admin" WHERE id = 'admin_default'
);

-- Adicionar campos do Mercado Pago se não existirem
DO $$ 
BEGIN
  -- Adicionar adminId como nullable primeiro
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Espaco' AND column_name = 'adminId') THEN
    ALTER TABLE "Espaco" ADD COLUMN "adminId" TEXT;
  END IF;

  -- Atualizar adminId para espaços existentes
  UPDATE "Espaco" SET "adminId" = 'admin_default' WHERE "adminId" IS NULL;

  -- Agora tornar adminId NOT NULL
  ALTER TABLE "Espaco" ALTER COLUMN "adminId" SET NOT NULL;

  -- Adicionar campos do Mercado Pago
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Espaco' AND column_name = 'mercadoPagoUserId') THEN
    ALTER TABLE "Espaco" ADD COLUMN "mercadoPagoUserId" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Espaco' AND column_name = 'mercadoPagoAccessToken') THEN
    ALTER TABLE "Espaco" ADD COLUMN "mercadoPagoAccessToken" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Espaco' AND column_name = 'mercadoPagoRefreshToken') THEN
    ALTER TABLE "Espaco" ADD COLUMN "mercadoPagoRefreshToken" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Espaco' AND column_name = 'mercadoPagoTokenExpiresAt') THEN
    ALTER TABLE "Espaco" ADD COLUMN "mercadoPagoTokenExpiresAt" TIMESTAMP(3);
  END IF;

  -- Adicionar foreign key se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Espaco_adminId_fkey'
  ) THEN
    ALTER TABLE "Espaco" ADD CONSTRAINT "Espaco_adminId_fkey" 
    FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  -- Criar índice se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'Espaco' AND indexname = 'Espaco_adminId_idx'
  ) THEN
    CREATE INDEX "Espaco_adminId_idx" ON "Espaco"("adminId");
  END IF;
END $$;

-- AddForeignKey
ALTER TABLE "_EspacoUsuario" ADD CONSTRAINT "_EspacoUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Espaco"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EspacoUsuario" ADD CONSTRAINT "_EspacoUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EspacoCategoria" ADD CONSTRAINT "_EspacoCategoria_A_fkey" FOREIGN KEY ("A") REFERENCES "CategoriaEspaco"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EspacoCategoria" ADD CONSTRAINT "_EspacoCategoria_B_fkey" FOREIGN KEY ("B") REFERENCES "Espaco"("id") ON DELETE CASCADE ON UPDATE CASCADE;
