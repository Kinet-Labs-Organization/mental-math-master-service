/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ai_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ai_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `medical_records` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `medical_records` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `reminders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `reminders` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `ai_conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_date` to the `medical_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_date` to the `reminders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ai_conversations" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "medical_records" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "reminders" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_date" TIMESTAMP(3) NOT NULL;
