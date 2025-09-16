-- AlterTable
ALTER TABLE "public"."RegistroCompras" ALTER COLUMN "comprovante" SET DEFAULT md5(random()::text || clock_timestamp()::text);

-- CreateTable
CREATE TABLE "public"."PixPayment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "asaasId" TEXT NOT NULL,
    "qrCode" TEXT,
    "qrCodeBase64" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PixPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PixPayment_asaasId_key" ON "public"."PixPayment"("asaasId");

-- AddForeignKey
ALTER TABLE "public"."PixPayment" ADD CONSTRAINT "PixPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
