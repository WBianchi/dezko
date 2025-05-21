/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Espaco` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Espaco_nome_key";

-- AlterTable
ALTER TABLE "Espaco" 
ADD COLUMN "email" TEXT,
ADD COLUMN "senha" TEXT;

-- Atualizar registros existentes
UPDATE "Espaco" e
SET email = CONCAT(LOWER(REPLACE(e.nome, ' ', '')), '@dezko.com'),
    senha = '$argon2id$v=19$m=65536,t=3,p=4$3Fy9lqkXQnOSPXZFVHYqiQ$+sR3xn+dR+/TtE9VnJyO3BbYH5xGhi6oJEMFgIwtlPY'; -- hash de '123456'

-- Tornar as colunas NOT NULL
ALTER TABLE "Espaco" 
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "senha" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Espaco_email_key" ON "Espaco"("email");
