-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL DEFAULT '1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nomeSite" TEXT NOT NULL,
    "descricaoSite" TEXT NOT NULL,
    "emailContato" TEXT NOT NULL,
    "telefoneContato" TEXT NOT NULL,
    "enderecoEmpresa" TEXT NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);
