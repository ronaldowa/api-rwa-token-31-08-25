-- CreateTable
CREATE TABLE "public"."RegistroCompras" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "valorDaCompra" DOUBLE PRECISION NOT NULL,
    "quantidadeToken" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprovante" TEXT NOT NULL DEFAULT md5(random()::text || clock_timestamp()::text),

    CONSTRAINT "RegistroCompras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistroCompras_userId_idx" ON "public"."RegistroCompras"("userId");

-- AddForeignKey
ALTER TABLE "public"."RegistroCompras" ADD CONSTRAINT "RegistroCompras_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
