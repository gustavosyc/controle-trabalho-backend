/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Ferias" ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pendente';

-- AlterTable
ALTER TABLE "Folha" ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "valorTotal" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Jornada" ADD COLUMN     "aprovadoPor" INTEGER,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataAprovacao" TIMESTAMP(3),
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pendente';

-- AlterTable
ALTER TABLE "Producao" ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "dataAdmissao" TIMESTAMP(3),
ADD COLUMN     "dataNascimento" TIMESTAMP(3),
ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "foto" TEXT,
ADD COLUMN     "rg" TEXT,
ADD COLUMN     "salario" DOUBLE PRECISION,
ADD COLUMN     "telefone" TEXT;

-- CreateTable
CREATE TABLE "Meta" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "valorAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mes" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BancoHoras" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mes" TEXT NOT NULL,
    "entrada" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saida" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BancoHoras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- AddForeignKey
ALTER TABLE "Jornada" ADD CONSTRAINT "Jornada_aprovadoPor_fkey" FOREIGN KEY ("aprovadoPor") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BancoHoras" ADD CONSTRAINT "BancoHoras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
