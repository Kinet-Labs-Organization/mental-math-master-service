/*
  Warnings:

  - The values [BEHAVIOR,HEALTH,NUTRITION,GROOMING,TRAINING,EMERGENCY,GENERAL] on the enum `ConcernType` will be removed. If these variants are still used in the database, this will fail.
  - The values [VACCINATION,CHECKUP,TREATMENT,SURGERY,PRESCRIPTION,TEST_RESULT,OTHER] on the enum `MedicalRecordType` will be removed. If these variants are still used in the database, this will fail.
  - The values [MALE,FEMALE] on the enum `PetGender` will be removed. If these variants are still used in the database, this will fail.
  - The values [DOG,CAT,COW,HORSE,BIRD,OTHER,RABBIT,HAMSTER,FISH] on the enum `PetType` will be removed. If these variants are still used in the database, this will fail.
  - The values [ONCE,DAILY,WEEKLY,MONTHLY,CUSTOM] on the enum `ReminderFrequency` will be removed. If these variants are still used in the database, this will fail.
  - The values [FEEDING,MEDICATION,GROOMING,EXERCISE,VACCINATION,CHECKUP,OTHER] on the enum `ReminderType` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUPER_ADMIN,ADMIN,NORMAL] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ConcernType_new" AS ENUM ('behavior', 'health', 'nutrition', 'grooming', 'training', 'emergency', 'general');
ALTER TABLE "ai_conversations" ALTER COLUMN "concern_type" TYPE "ConcernType_new" USING ("concern_type"::text::"ConcernType_new");
ALTER TYPE "ConcernType" RENAME TO "ConcernType_old";
ALTER TYPE "ConcernType_new" RENAME TO "ConcernType";
DROP TYPE "ConcernType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MedicalRecordType_new" AS ENUM ('vaccination', 'checkup', 'treatment', 'surgery', 'prescription', 'test_result', 'other');
ALTER TABLE "medical_records" ALTER COLUMN "record_type" TYPE "MedicalRecordType_new" USING ("record_type"::text::"MedicalRecordType_new");
ALTER TYPE "MedicalRecordType" RENAME TO "MedicalRecordType_old";
ALTER TYPE "MedicalRecordType_new" RENAME TO "MedicalRecordType";
DROP TYPE "MedicalRecordType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PetGender_new" AS ENUM ('male', 'female');
ALTER TABLE "pets" ALTER COLUMN "gender" TYPE "PetGender_new" USING ("gender"::text::"PetGender_new");
ALTER TYPE "PetGender" RENAME TO "PetGender_old";
ALTER TYPE "PetGender_new" RENAME TO "PetGender";
DROP TYPE "PetGender_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PetType_new" AS ENUM ('dog', 'cat', 'bird', 'horse', 'cow', 'rabbit', 'hamster', 'fish', 'other');
ALTER TABLE "pets" ALTER COLUMN "type" TYPE "PetType_new" USING ("type"::text::"PetType_new");
ALTER TYPE "PetType" RENAME TO "PetType_old";
ALTER TYPE "PetType_new" RENAME TO "PetType";
DROP TYPE "PetType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReminderFrequency_new" AS ENUM ('once', 'daily', 'weekly', 'monthly', 'custom');
ALTER TABLE "reminders" ALTER COLUMN "frequency" TYPE "ReminderFrequency_new" USING ("frequency"::text::"ReminderFrequency_new");
ALTER TYPE "ReminderFrequency" RENAME TO "ReminderFrequency_old";
ALTER TYPE "ReminderFrequency_new" RENAME TO "ReminderFrequency";
DROP TYPE "ReminderFrequency_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReminderType_new" AS ENUM ('feeding', 'medication', 'grooming', 'exercise', 'vaccination', 'checkup', 'other');
ALTER TABLE "reminders" ALTER COLUMN "reminder_type" TYPE "ReminderType_new" USING ("reminder_type"::text::"ReminderType_new");
ALTER TYPE "ReminderType" RENAME TO "ReminderType_old";
ALTER TYPE "ReminderType_new" RENAME TO "ReminderType";
DROP TYPE "ReminderType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('super_admin', 'admin', 'normal');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;
