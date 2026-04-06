/*
  Warnings:

  - A unique constraint covering the columns `[email_verification_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "color" TEXT,
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "size" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verification_expires" TIMESTAMP(3),
ADD COLUMN     "email_verification_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_verification_token_key" ON "users"("email_verification_token");
