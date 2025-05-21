/*
  Warnings:

  - You are about to drop the column `conteudo` on the `Mensagem` table. All the data in the column will be lost.
  - Added the required column `assunto` to the `Mensagem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mensagem` to the `Mensagem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mensagem" DROP COLUMN "conteudo",
ADD COLUMN     "assunto" TEXT NOT NULL,
ADD COLUMN     "lida" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mensagem" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Resposta" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mensagem" TEXT NOT NULL,
    "mensagemId" TEXT NOT NULL,

    CONSTRAINT "Resposta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_mensagemId_fkey" FOREIGN KEY ("mensagemId") REFERENCES "Mensagem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
