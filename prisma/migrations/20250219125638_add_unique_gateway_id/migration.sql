/*
  Warnings:

  - A unique constraint covering the columns `[gatewayId]` on the table `Pagamento` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_gatewayId_key" ON "Pagamento"("gatewayId");
