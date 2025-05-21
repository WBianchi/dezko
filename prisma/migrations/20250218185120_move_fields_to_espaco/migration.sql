/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Espaco` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Espaco` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoReserva" AS ENUM ('HORA', 'TURNO', 'DIA');

-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('MANHA', 'TARDE', 'NOITE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('usuario', 'admin');

-- AlterTable
ALTER TABLE "Espaco" ADD COLUMN     "adicionais" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "beneficios" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "categoria" TEXT NOT NULL DEFAULT 'PADRAO',
ADD COLUMN     "fotoCapa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fotoPrincipal" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "galeria" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "telefone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "vantagens" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "agendaId" TEXT;

-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "tipoReserva" "TipoReserva" NOT NULL,
    "turno" "Turno",
    "horaInicio" TEXT,
    "horaFim" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "valorHora" DOUBLE PRECISION,
    "valorTurno" DOUBLE PRECISION,
    "valorDia" DOUBLE PRECISION,
    "espacoId" TEXT NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Espaco_userId_key" ON "Espaco"("userId");

-- AddForeignKey
ALTER TABLE "Espaco" ADD CONSTRAINT "Espaco_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
