/*
  Warnings:

  - Added the required column `projetoId` to the `RegistroCompras` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."RegistroCompras" ADD COLUMN     "projetoId" INTEGER NOT NULL,
ALTER COLUMN "comprovante" SET DEFAULT md5(random()::text || clock_timestamp()::text);

-- CreateIndex
CREATE INDEX "RegistroCompras_projetoId_idx" ON "public"."RegistroCompras"("projetoId");

-- AddForeignKey
ALTER TABLE "public"."RegistroCompras" ADD CONSTRAINT "RegistroCompras_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "public"."Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
