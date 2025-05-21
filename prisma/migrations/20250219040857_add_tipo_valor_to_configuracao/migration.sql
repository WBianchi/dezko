-- AlterTable
ALTER TABLE "Configuracao" ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'site',
ADD COLUMN     "valor" TEXT NOT NULL DEFAULT '{}';
