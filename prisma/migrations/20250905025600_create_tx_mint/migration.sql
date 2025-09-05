-- CreateTable
CREATE TABLE "public"."TxMint" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "toAddress" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "TxMint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TxMint_txHash_key" ON "public"."TxMint"("txHash");

-- CreateIndex
CREATE INDEX "TxMint_userId_idx" ON "public"."TxMint"("userId");

-- AddForeignKey
ALTER TABLE "public"."TxMint" ADD CONSTRAINT "TxMint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
