/*
  Warnings:

  - You are about to drop the column `imagens` on the `Espaco` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Espaco" DROP COLUMN "imagens",
ADD COLUMN     "capacidade" TEXT,
ADD COLUMN     "fotoCapa" TEXT,
ADD COLUMN     "fotoPrincipal" TEXT DEFAULT '',
ADD COLUMN     "galeria" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Horarios" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "espacoId" TEXT NOT NULL,
    "diaSemana" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,

    CONSTRAINT "Horarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adicionais" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "espacoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Adicionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vantagens" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "espacoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Vantagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficios" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "espacoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Horarios_espacoId_idx" ON "Horarios"("espacoId");

-- CreateIndex
CREATE INDEX "Adicionais_espacoId_idx" ON "Adicionais"("espacoId");

-- CreateIndex
CREATE INDEX "Vantagens_espacoId_idx" ON "Vantagens"("espacoId");

-- CreateIndex
CREATE INDEX "Beneficios_espacoId_idx" ON "Beneficios"("espacoId");

-- AddForeignKey
ALTER TABLE "Horarios" ADD CONSTRAINT "Horarios_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adicionais" ADD CONSTRAINT "Adicionais_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vantagens" ADD CONSTRAINT "Vantagens_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficios" ADD CONSTRAINT "Beneficios_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
