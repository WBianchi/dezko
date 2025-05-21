-- AlterTable
ALTER TABLE "Assinatura" ADD COLUMN     "formaPagamento" "FormaDePagamento" DEFAULT 'PIX',
ADD COLUMN     "mercadoPagoPaymentId" TEXT,
ADD COLUMN     "mercadoPagoPreferenceId" TEXT,
ADD COLUMN     "planoId" TEXT;

-- AlterTable
ALTER TABLE "RenovacaoAssinatura" ADD COLUMN     "formaPagamento" "FormaDePagamento" DEFAULT 'PIX',
ADD COLUMN     "mercadoPagoPaymentId" TEXT,
ADD COLUMN     "mercadoPagoPreferenceId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PAGO';

-- CreateIndex
CREATE INDEX "Assinatura_planoId_idx" ON "Assinatura"("planoId");

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE SET NULL ON UPDATE CASCADE;
