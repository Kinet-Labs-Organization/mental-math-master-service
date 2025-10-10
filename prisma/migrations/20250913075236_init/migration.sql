/*
  Warnings:

  - Made the column `company_id` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "company_id" SET NOT NULL;
