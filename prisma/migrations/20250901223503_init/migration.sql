-- CreateTable
CREATE TABLE "public"."Projeto" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "numContrato" TEXT NOT NULL,
    "valorEth" DOUBLE PRECISION NOT NULL,
    "fotos" TEXT[],
    "quantidadeToken" INTEGER NOT NULL,
    "precoEth" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Projeto_numContrato_key" ON "public"."Projeto"("numContrato");
