/*
  Warnings:

  - You are about to drop the column `precoEth` on the `Projeto` table. All the data in the column will be lost.
  - You are about to drop the column `quantidadeToken` on the `Projeto` table. All the data in the column will be lost.
  - You are about to drop the column `valorEth` on the `Projeto` table. All the data in the column will be lost.
  - Added the required column `totalTokens` to the `Projeto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Projeto" DROP COLUMN "precoEth",
DROP COLUMN "quantidadeToken",
DROP COLUMN "valorEth",
ADD COLUMN     "precoTokenBRL" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ativo',
ADD COLUMN     "totalTokens" INTEGER NOT NULL;
