-- AlterTable
ALTER TABLE "Espaco" ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "mercadoPagoIntegrated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mercadoPagoPublicKey" TEXT,
ADD COLUMN     "razaoSocial" TEXT;
