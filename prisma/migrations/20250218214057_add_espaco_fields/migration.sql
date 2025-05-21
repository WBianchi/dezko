/*
  Warnings:

  - You are about to drop the column `categoria` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `galeria` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `Espaco` table. All the data in the column will be lost.
  - Added the required column `valor` to the `Espaco` table without a default value. This is not possible if the table is not empty.
  - Made the column `endereco` on table `Espaco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cidade` on table `Espaco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estado` on table `Espaco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `descricao` on table `Espaco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bairro` on table `Espaco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `capacidade` on table `Espaco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cep` on table `Espaco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `horarioAbertura` on table `Espaco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `horarioFechamento` on table `Espaco` required. This step will fail if there are existing NULL values in that column.
  - Made the column `numero` on table `Espaco` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Espaco_email_key";

-- DropIndex
DROP INDEX "Espaco_userId_key";

-- AlterTable
ALTER TABLE "Espaco" DROP COLUMN "categoria",
DROP COLUMN "email",
DROP COLUMN "galeria",
DROP COLUMN "senha",
DROP COLUMN "telefone",
ADD COLUMN     "imagens" TEXT[],
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ativo',
ADD COLUMN     "valor" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "endereco" SET NOT NULL,
ALTER COLUMN "cidade" SET NOT NULL,
ALTER COLUMN "estado" SET NOT NULL,
ALTER COLUMN "descricao" SET NOT NULL,
ALTER COLUMN "bairro" SET NOT NULL,
ALTER COLUMN "bairro" SET DEFAULT '',
ALTER COLUMN "capacidade" SET NOT NULL,
ALTER COLUMN "capacidade" SET DEFAULT 0,
ALTER COLUMN "cep" SET NOT NULL,
ALTER COLUMN "horarioAbertura" SET NOT NULL,
ALTER COLUMN "horarioAbertura" SET DEFAULT '',
ALTER COLUMN "horarioFechamento" SET NOT NULL,
ALTER COLUMN "horarioFechamento" SET DEFAULT '',
ALTER COLUMN "numero" SET NOT NULL,
ALTER COLUMN "numero" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "avatar" TEXT;

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "transactionId" TEXT,
    "paymentData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceConfig" (
    "id" TEXT NOT NULL,
    "mercadoPago" JSONB,

    CONSTRAINT "SpaceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "mercadoPagoKeys" JSONB NOT NULL,
    "defaultCommission" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceCommission" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaceCommission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reservation_spaceId_idx" ON "Reservation"("spaceId");

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reservationId_key" ON "Payment"("reservationId");

-- CreateIndex
CREATE INDEX "Payment_reservationId_idx" ON "Payment"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "SpaceCommission_spaceId_key" ON "SpaceCommission"("spaceId");

-- CreateIndex
CREATE INDEX "SpaceCommission_spaceId_idx" ON "SpaceCommission"("spaceId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceConfig" ADD CONSTRAINT "SpaceConfig_id_fkey" FOREIGN KEY ("id") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceCommission" ADD CONSTRAINT "SpaceCommission_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
