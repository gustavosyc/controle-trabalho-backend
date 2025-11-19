-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cargo" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jornada" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "entrada" TIMESTAMP(3) NOT NULL,
    "saida" TIMESTAMP(3) NOT NULL,
    "horasTotais" DOUBLE PRECISION NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Jornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producao" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "observacao" TEXT,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Producao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ferias" (
    "id" SERIAL NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Ferias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folha" (
    "id" SERIAL NOT NULL,
    "mes" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Folha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_login_key" ON "Usuario"("login");

-- AddForeignKey
ALTER TABLE "Jornada" ADD CONSTRAINT "Jornada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producao" ADD CONSTRAINT "Producao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ferias" ADD CONSTRAINT "Ferias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folha" ADD CONSTRAINT "Folha_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
