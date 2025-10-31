/*
  Warnings:

  - A unique constraint covering the columns `[vendorId]` on the table `vendor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vendorId` to the `vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ALTER COLUMN "sku" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vendor" ADD COLUMN     "vendorId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "vendor_vendorId_key" ON "vendor"("vendorId");
