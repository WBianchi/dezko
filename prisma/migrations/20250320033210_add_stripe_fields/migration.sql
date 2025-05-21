-- AlterTable
ALTER TABLE "Espaco" ADD COLUMN     "stripeConnectAccountId" TEXT;

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeSessionId" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "stripeCustomerId" TEXT;
