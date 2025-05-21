-- AlterTable
ALTER TABLE "Espaco" ADD COLUMN     "categoriaId" TEXT;

-- CreateTable
CREATE TABLE "CategoriaEspaco" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoriaEspaco_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaEspaco_slug_key" ON "CategoriaEspaco"("slug");

-- CreateIndex
CREATE INDEX "Espaco_userId_idx" ON "Espaco"("userId");

-- CreateIndex
CREATE INDEX "Espaco_categoriaId_idx" ON "Espaco"("categoriaId");

-- AddForeignKey
ALTER TABLE "Espaco" ADD CONSTRAINT "Espaco_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaEspaco"("id") ON DELETE SET NULL ON UPDATE CASCADE;
