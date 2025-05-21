/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Espaco` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Espaco_nome_key" ON "Espaco"("nome");
