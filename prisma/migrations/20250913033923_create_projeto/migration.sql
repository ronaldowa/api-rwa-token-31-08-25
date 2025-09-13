/*
  Warnings:

  - Added the required column `dataRecebimento` to the `Projeto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `detalhesProjeto` to the `Projeto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inicioDaCapitacao` to the `Projeto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Cart" ADD COLUMN     "publicAddress" TEXT;

-- AlterTable
ALTER TABLE "public"."Projeto" ADD COLUMN     "dataRecebimento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "detalhesProjeto" TEXT NOT NULL,
ADD COLUMN     "inicioDaCapitacao" TIMESTAMP(3) NOT NULL;
