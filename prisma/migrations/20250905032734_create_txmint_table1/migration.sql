/*
  Warnings:

  - Added the required column `projetoId` to the `TxMint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."TxMint" ADD COLUMN     "projetoId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "TxMint_projetoId_idx" ON "public"."TxMint"("projetoId");

-- AddForeignKey
ALTER TABLE "public"."TxMint" ADD CONSTRAINT "TxMint_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "public"."Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
