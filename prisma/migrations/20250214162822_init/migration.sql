-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ESPACO', 'USER');

-- CreateEnum
CREATE TYPE "FormaDePagamento" AS ENUM ('PIX', 'BOLETO', 'CARTAO_CREDITO');

-- CreateEnum
CREATE TYPE "StatusDoPedido" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO', 'REEMBOLSADO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "StatusDoAgendamento" AS ENUM ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "SplitRule" AS ENUM ('PERCENT', 'FIXED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Espaco" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "diasDisponiveis" JSONB NOT NULL,
    "horariosDisponiveis" JSONB NOT NULL,
    "turnosDisponiveis" JSONB NOT NULL,
    "valorDoDia" DOUBLE PRECISION NOT NULL,
    "valorDaHora" DOUBLE PRECISION NOT NULL,
    "valorDoTurno" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,
    "adicionais" JSONB NOT NULL,
    "vantagens" JSONB NOT NULL,
    "beneficios" JSONB NOT NULL,
    "foto" TEXT,
    "galeriaDeFotos" JSONB,
    "banner" TEXT,
    "logo" TEXT,

    CONSTRAINT "Espaco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL,
    "avaliacao" TEXT NOT NULL,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "rejeitado" BOOLEAN NOT NULL DEFAULT false,
    "espacoId" INTEGER NOT NULL,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "informacaoDeVenda" TEXT,
    "produto" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "lucro" DOUBLE PRECISION,
    "formaDePagamento" "FormaDePagamento" NOT NULL,
    "qtdParcelas" INTEGER,
    "valorParcela" DOUBLE PRECISION,
    "splitRule" "SplitRule",
    "splitValue" DOUBLE PRECISION,
    "dataDoAgendamento" TIMESTAMP(3) NOT NULL,
    "horario" TEXT NOT NULL,
    "turno" TEXT NOT NULL,
    "statusDoPedido" "StatusDoPedido" NOT NULL,
    "statusDoAgendamento" "StatusDoAgendamento" NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "espacoId" INTEGER NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plano" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT,
    "duracaoDias" INTEGER,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conteudo" TEXT NOT NULL,
    "remetenteId" INTEGER,
    "destinatarioId" INTEGER,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Espaco_email_key" ON "Espaco"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
