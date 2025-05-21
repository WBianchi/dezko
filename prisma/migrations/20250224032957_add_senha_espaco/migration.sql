/*
  Warnings:

  - Added the required column `senha` to the `Espaco` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Espaco" ADD COLUMN "senha" TEXT NOT NULL DEFAULT '123456';
-- RemoveDefault
ALTER TABLE "Espaco" ALTER COLUMN "senha" DROP DEFAULT;
