/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ai_conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medical_records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reminders` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `company_name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'agent';

-- DropForeignKey
ALTER TABLE "ai_conversations" DROP CONSTRAINT "ai_conversations_pet_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_conversations" DROP CONSTRAINT "ai_conversations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "medical_records" DROP CONSTRAINT "medical_records_pet_id_fkey";

-- DropForeignKey
ALTER TABLE "medical_records" DROP CONSTRAINT "medical_records_user_id_fkey";

-- DropForeignKey
ALTER TABLE "pets" DROP CONSTRAINT "pets_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reminders" DROP CONSTRAINT "reminders_pet_id_fkey";

-- DropForeignKey
ALTER TABLE "reminders" DROP CONSTRAINT "reminders_user_id_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "company_name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;

-- DropTable
DROP TABLE "ai_conversations";

-- DropTable
DROP TABLE "medical_records";

-- DropTable
DROP TABLE "pets";

-- DropTable
DROP TABLE "reminders";

-- DropEnum
DROP TYPE "ConcernType";

-- DropEnum
DROP TYPE "MedicalRecordType";

-- DropEnum
DROP TYPE "PetGender";

-- DropEnum
DROP TYPE "PetType";

-- DropEnum
DROP TYPE "ReminderFrequency";

-- DropEnum
DROP TYPE "ReminderType";

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "orders" TEXT[],
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_details" JSONB[],
    "customer_details" JSONB NOT NULL,
    "order_note" TEXT,
    "total" DOUBLE PRECISION NOT NULL,
    "billed_by" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
