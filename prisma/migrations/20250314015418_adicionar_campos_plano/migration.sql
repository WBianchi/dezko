-- AlterTable
ALTER TABLE "Plano" ADD COLUMN     "limiteAgendas" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'basico';

-- CreateTable
CREATE TABLE "BeneficioPlano" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nome" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,

    CONSTRAINT "BeneficioPlano_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BeneficioPlano_planoId_idx" ON "BeneficioPlano"("planoId");

-- AddForeignKey
ALTER TABLE "BeneficioPlano" ADD CONSTRAINT "BeneficioPlano_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
