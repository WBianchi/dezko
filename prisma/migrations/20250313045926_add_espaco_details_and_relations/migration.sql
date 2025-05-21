/*
  Warnings:

  - You are about to drop the column `galeria` on the `Espaco` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Espaco" DROP COLUMN "galeria",
ADD COLUMN     "imagens" TEXT[];
