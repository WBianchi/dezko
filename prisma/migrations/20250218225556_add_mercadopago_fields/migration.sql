-- AlterTable
ALTER TABLE "Espaco" ADD COLUMN     "mercadoPagoAccessToken" TEXT,
ADD COLUMN     "mercadoPagoRefreshToken" TEXT,
ADD COLUMN     "mercadoPagoTokenExpires" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "mercadoPagoPaymentId" TEXT,
ADD COLUMN     "mercadoPagoPreferenceId" TEXT;
