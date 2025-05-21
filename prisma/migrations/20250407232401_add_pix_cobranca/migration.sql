-- CreateTable
CREATE TABLE "PixCobranca" (
    "id" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "pedidoId" TEXT,
    "valor" INTEGER NOT NULL,
    "valorLojista" INTEGER NOT NULL,
    "valorPlataforma" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "descricao" TEXT NOT NULL,
    "qrCodeUrl" TEXT NOT NULL,
    "brCode" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "clienteNome" TEXT,
    "clienteEmail" TEXT,
    "clienteTelefone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PixCobranca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PixCobranca_espacoId_idx" ON "PixCobranca"("espacoId");

-- CreateIndex
CREATE INDEX "PixCobranca_pedidoId_idx" ON "PixCobranca"("pedidoId");

-- AddForeignKey
ALTER TABLE "PixCobranca" ADD CONSTRAINT "PixCobranca_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
