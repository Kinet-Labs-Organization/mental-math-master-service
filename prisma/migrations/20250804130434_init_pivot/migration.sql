/*
  Warnings:

  - You are about to drop the `ActivityLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Concern` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DietLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HelpRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reminder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSetting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeightLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PetGender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MedicalRecordType" AS ENUM ('VACCINATION', 'CHECKUP', 'TREATMENT', 'SURGERY', 'PRESCRIPTION', 'TEST_RESULT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('FEEDING', 'MEDICATION', 'GROOMING', 'EXERCISE', 'VACCINATION', 'CHECKUP', 'OTHER');

-- CreateEnum
CREATE TYPE "ReminderFrequency" AS ENUM ('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ConcernType" AS ENUM ('BEHAVIOR', 'HEALTH', 'NUTRITION', 'GROOMING', 'TRAINING', 'EMERGENCY', 'GENERAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PetType" ADD VALUE 'RABBIT';
ALTER TYPE "PetType" ADD VALUE 'HAMSTER';
ALTER TYPE "PetType" ADD VALUE 'FISH';

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_petId_fkey";

-- DropForeignKey
ALTER TABLE "Concern" DROP CONSTRAINT "Concern_petId_fkey";

-- DropForeignKey
ALTER TABLE "Concern" DROP CONSTRAINT "Concern_userId_fkey";

-- DropForeignKey
ALTER TABLE "DietLog" DROP CONSTRAINT "DietLog_petId_fkey";

-- DropForeignKey
ALTER TABLE "HelpRequest" DROP CONSTRAINT "HelpRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_petId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "Pet" DROP CONSTRAINT "Pet_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_petId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_userId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSetting" DROP CONSTRAINT "UserSetting_userId_fkey";

-- DropForeignKey
ALTER TABLE "WeightLog" DROP CONSTRAINT "WeightLog_petId_fkey";

-- DropTable
DROP TABLE "ActivityLog";

-- DropTable
DROP TABLE "Concern";

-- DropTable
DROP TABLE "DietLog";

-- DropTable
DROP TABLE "HelpRequest";

-- DropTable
DROP TABLE "MedicalRecord";

-- DropTable
DROP TABLE "Pet";

-- DropTable
DROP TABLE "Reminder";

-- DropTable
DROP TABLE "Subscription";

-- DropTable
DROP TABLE "UserAccount";

-- DropTable
DROP TABLE "UserSetting";

-- DropTable
DROP TABLE "Vet";

-- DropTable
DROP TABLE "WeightLog";

-- DropEnum
DROP TYPE "ReminderRepeat";

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PetType" NOT NULL,
    "breed" TEXT,
    "age" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "gender" "PetGender",
    "color" TEXT,
    "photo_url" TEXT,
    "microchip_id" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "record_type" "MedicalRecordType" NOT NULL,
    "vet_name" TEXT,
    "vet_clinic" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION,
    "file_urls" TEXT[],
    "next_appointment" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pet_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reminder_type" "ReminderType" NOT NULL,
    "frequency" "ReminderFrequency" NOT NULL,
    "reminder_time" TEXT,
    "reminder_date" TIMESTAMP(3) NOT NULL,
    "marked_complete" BOOLEAN NOT NULL DEFAULT false,
    "last_completed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pet_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "concern_type" "ConcernType" NOT NULL,
    "user_message" TEXT NOT NULL,
    "ai_response" TEXT NOT NULL,
    "image_urls" TEXT[],
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "user_feedback" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pet_id" TEXT,
    "user_id" TEXT,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
