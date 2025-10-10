-- AlterTable
ALTER TABLE "User" ALTER COLUMN "sign_up_method" DROP DEFAULT;

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "name" DROP NOT NULL;
