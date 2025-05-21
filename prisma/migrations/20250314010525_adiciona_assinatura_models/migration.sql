-- CreateTable
CREATE TABLE "Assinatura" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataExpiracao" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "espacoId" TEXT NOT NULL,

    CONSTRAINT "Assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenovacaoAssinatura" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assinaturaId" TEXT NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "gateway" TEXT NOT NULL DEFAULT 'mercadopago',
    "gatewayId" TEXT,

    CONSTRAINT "RenovacaoAssinatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assinatura_espacoId_idx" ON "Assinatura"("espacoId");

-- CreateIndex
CREATE INDEX "RenovacaoAssinatura_assinaturaId_idx" ON "RenovacaoAssinatura"("assinaturaId");

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenovacaoAssinatura" ADD CONSTRAINT "RenovacaoAssinatura_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "Assinatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
