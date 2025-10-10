/*
  Warnings:

  - Made the column `companyName` on table `vendor_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `vendor_users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "vendor_users" ALTER COLUMN "companyName" SET NOT NULL,
ALTER COLUMN "companyId" SET NOT NULL;
