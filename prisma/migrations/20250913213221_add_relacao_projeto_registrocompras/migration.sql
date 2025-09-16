-- AlterTable
ALTER TABLE "public"."RegistroCompras" ALTER COLUMN "comprovante" SET DEFAULT md5(random()::text || clock_timestamp()::text);
