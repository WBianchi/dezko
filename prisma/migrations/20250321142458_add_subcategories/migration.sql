-- AlterTable
ALTER TABLE "CategoriaEspaco" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "SubCategoriaEspaco" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT,
    "categoriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubCategoriaEspaco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EspacoSubCategoria" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EspacoSubCategoria_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubCategoriaEspaco_slug_key" ON "SubCategoriaEspaco"("slug");

-- CreateIndex
CREATE INDEX "SubCategoriaEspaco_categoriaId_idx" ON "SubCategoriaEspaco"("categoriaId");

-- CreateIndex
CREATE INDEX "_EspacoSubCategoria_B_index" ON "_EspacoSubCategoria"("B");

-- AddForeignKey
ALTER TABLE "SubCategoriaEspaco" ADD CONSTRAINT "SubCategoriaEspaco_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaEspaco"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EspacoSubCategoria" ADD CONSTRAINT "_EspacoSubCategoria_A_fkey" FOREIGN KEY ("A") REFERENCES "Espaco"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EspacoSubCategoria" ADD CONSTRAINT "_EspacoSubCategoria_B_fkey" FOREIGN KEY ("B") REFERENCES "SubCategoriaEspaco"("id") ON DELETE CASCADE ON UPDATE CASCADE;
