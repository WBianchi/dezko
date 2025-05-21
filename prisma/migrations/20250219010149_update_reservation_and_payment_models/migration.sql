/*
  Warnings:

  - You are about to drop the column `amount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentData` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `spaceId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `gateway` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gatewayId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valor` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataFim` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataInicio` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `espacoId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valor` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- Primeiro, removemos as restrições e índices
DROP INDEX IF EXISTS "Payment_reservationId_key";
DROP INDEX IF EXISTS "Reservation_spaceId_idx";

ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS "Reservation_spaceId_fkey";

-- Adicionamos as colunas como nullable
ALTER TABLE "Payment" 
ADD COLUMN "gateway" TEXT,
ADD COLUMN "gatewayId" TEXT,
ADD COLUMN "metadata" JSONB,
ADD COLUMN "valor" DOUBLE PRECISION;

ALTER TABLE "Reservation"
ADD COLUMN "dataFim" TIMESTAMP(3),
ADD COLUMN "dataInicio" TIMESTAMP(3),
ADD COLUMN "espacoId" TEXT,
ADD COLUMN "mercadoPagoPaymentId" TEXT,
ADD COLUMN "mercadoPagoPreferenceId" TEXT,
ADD COLUMN "planoId" TEXT,
ADD COLUMN "valor" DOUBLE PRECISION;

-- Migramos os dados existentes
UPDATE "Payment" 
SET 
  "gateway" = 'mercadopago',
  "gatewayId" = COALESCE("transactionId", 'unknown'),
  "metadata" = COALESCE("paymentData", '{}'),
  "valor" = COALESCE("amount", 0);

UPDATE "Reservation"
SET 
  "dataInicio" = "date" + ("startTime"::interval),
  "dataFim" = "date" + ("endTime"::interval),
  "espacoId" = "spaceId",
  "valor" = COALESCE((SELECT "amount" FROM "Payment" WHERE "Payment"."reservationId" = "Reservation"."id"), 0);

-- Agora tornamos as colunas NOT NULL
ALTER TABLE "Payment" 
ALTER COLUMN "gateway" SET NOT NULL,
ALTER COLUMN "gatewayId" SET NOT NULL,
ALTER COLUMN "valor" SET NOT NULL;

ALTER TABLE "Reservation"
ALTER COLUMN "dataFim" SET NOT NULL,
ALTER COLUMN "dataInicio" SET NOT NULL,
ALTER COLUMN "espacoId" SET NOT NULL,
ALTER COLUMN "valor" SET NOT NULL;

-- Removemos as colunas antigas
ALTER TABLE "Payment" 
DROP COLUMN "amount",
DROP COLUMN "method",
DROP COLUMN "paymentData",
DROP COLUMN "transactionId";

ALTER TABLE "Reservation"
DROP COLUMN "date",
DROP COLUMN "endTime",
DROP COLUMN "spaceId",
DROP COLUMN "startTime";

-- Criamos os novos índices
CREATE INDEX "Reservation_espacoId_idx" ON "Reservation"("espacoId");
CREATE INDEX "Reservation_planoId_idx" ON "Reservation"("planoId");

-- Adicionamos as novas chaves estrangeiras
ALTER TABLE "Reservation" 
ADD CONSTRAINT "Reservation_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT "Reservation_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Atualizamos os defaults
ALTER TABLE "Reservation" ALTER COLUMN "status" SET DEFAULT 'pendente';
ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;
