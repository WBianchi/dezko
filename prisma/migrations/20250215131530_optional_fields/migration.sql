/*
  Warnings:

  - The primary key for the `Admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role` on the `Admin` table. All the data in the column will be lost.
  - The primary key for the `Avaliacao` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aprovado` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `avaliacao` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `pontuacao` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `rejeitado` on the `Avaliacao` table. All the data in the column will be lost.
  - The primary key for the `Espaco` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `adicionais` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `banner` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `beneficios` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `diasDisponiveis` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `foto` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `galeriaDeFotos` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `horariosDisponiveis` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `turnosDisponiveis` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `valorDaHora` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `valorDoDia` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `valorDoTurno` on the `Espaco` table. All the data in the column will be lost.
  - You are about to drop the column `vantagens` on the `Espaco` table. All the data in the column will be lost.
  - The primary key for the `Mensagem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `destinatarioId` on the `Mensagem` table. All the data in the column will be lost.
  - You are about to drop the column `remetenteId` on the `Mensagem` table. All the data in the column will be lost.
  - The primary key for the `Pedido` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `data` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `dataDoAgendamento` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `formaDePagamento` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `horario` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `informacaoDeVenda` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `lucro` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `preco` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `produto` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `qtdParcelas` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `splitRule` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `splitValue` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `statusDoAgendamento` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `statusDoPedido` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `turno` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `valorParcela` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `valorTotal` on the `Pedido` table. All the data in the column will be lost.
  - The primary key for the `Plano` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `duracaoDias` on the `Plano` table. All the data in the column will be lost.
  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cnpj]` on the table `Espaco` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nota` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bairro` to the `Espaco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cep` to the `Espaco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `Espaco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `Espaco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `espacoId` to the `Mensagem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Mensagem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataFim` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataInicio` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formaPagamento` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planoId` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valor` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duracao` to the `Plano` table without a default value. This is not possible if the table is not empty.
  - Added the required column `espacoId` to the `Plano` table without a default value. This is not possible if the table is not empty.
  - Made the column `descricao` on table `Plano` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_espacoId_fkey";

-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_espacoId_fkey";

-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_pkey",
DROP COLUMN "role",
ADD COLUMN     "telefone" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Admin_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Admin_id_seq";

-- AlterTable
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_pkey",
DROP COLUMN "aprovado",
DROP COLUMN "avaliacao",
DROP COLUMN "email",
DROP COLUMN "nome",
DROP COLUMN "pontuacao",
DROP COLUMN "rejeitado",
ADD COLUMN     "comentario" TEXT,
ADD COLUMN     "nota" INTEGER NOT NULL,
ADD COLUMN     "usuarioId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "espacoId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Avaliacao_id_seq";

-- AlterTable
ALTER TABLE "Espaco" DROP CONSTRAINT "Espaco_pkey",
DROP COLUMN "adicionais",
DROP COLUMN "banner",
DROP COLUMN "beneficios",
DROP COLUMN "diasDisponiveis",
DROP COLUMN "foto",
DROP COLUMN "galeriaDeFotos",
DROP COLUMN "horariosDisponiveis",
DROP COLUMN "logo",
DROP COLUMN "turnosDisponiveis",
DROP COLUMN "valorDaHora",
DROP COLUMN "valorDoDia",
DROP COLUMN "valorDoTurno",
DROP COLUMN "vantagens",
ADD COLUMN     "amenidades" TEXT[],
ADD COLUMN     "bairro" TEXT NOT NULL,
ADD COLUMN     "capacidade" INTEGER,
ADD COLUMN     "cep" TEXT NOT NULL,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "fotos" TEXT[],
ADD COLUMN     "horarioAbertura" TEXT,
ADD COLUMN     "horarioFechamento" TEXT,
ADD COLUMN     "numero" TEXT NOT NULL,
ADD COLUMN     "preco" DOUBLE PRECISION,
ADD COLUMN     "senha" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "telefone" DROP NOT NULL,
ALTER COLUMN "categoria" DROP NOT NULL,
ALTER COLUMN "descricao" DROP NOT NULL,
ADD CONSTRAINT "Espaco_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Espaco_id_seq";

-- AlterTable
ALTER TABLE "Mensagem" DROP CONSTRAINT "Mensagem_pkey",
DROP COLUMN "destinatarioId",
DROP COLUMN "remetenteId",
ADD COLUMN     "espacoId" TEXT NOT NULL,
ADD COLUMN     "lida" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usuarioId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Mensagem_id_seq";

-- AlterTable
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_pkey",
DROP COLUMN "data",
DROP COLUMN "dataDoAgendamento",
DROP COLUMN "formaDePagamento",
DROP COLUMN "horario",
DROP COLUMN "informacaoDeVenda",
DROP COLUMN "lucro",
DROP COLUMN "preco",
DROP COLUMN "produto",
DROP COLUMN "qtdParcelas",
DROP COLUMN "quantidade",
DROP COLUMN "splitRule",
DROP COLUMN "splitValue",
DROP COLUMN "statusDoAgendamento",
DROP COLUMN "statusDoPedido",
DROP COLUMN "turno",
DROP COLUMN "valorParcela",
DROP COLUMN "valorTotal",
ADD COLUMN     "dataFim" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dataInicio" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "formaPagamento" "FormaDePagamento" NOT NULL,
ADD COLUMN     "planoId" TEXT NOT NULL,
ADD COLUMN     "statusAgendamento" "StatusDoAgendamento" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "statusPedido" "StatusDoPedido" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "valor" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "usuarioId" SET DATA TYPE TEXT,
ALTER COLUMN "espacoId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Pedido_id_seq";

-- AlterTable
ALTER TABLE "Plano" DROP CONSTRAINT "Plano_pkey",
DROP COLUMN "duracaoDias",
ADD COLUMN     "duracao" INTEGER NOT NULL,
ADD COLUMN     "espacoId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "descricao" SET NOT NULL,
ADD CONSTRAINT "Plano_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Plano_id_seq";

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "role",
ADD COLUMN     "cpf" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "telefone" DROP NOT NULL,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Usuario_id_seq";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "SplitRule";

-- CreateIndex
CREATE UNIQUE INDEX "Espaco_cnpj_key" ON "Espaco"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- AddForeignKey
ALTER TABLE "Plano" ADD CONSTRAINT "Plano_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
