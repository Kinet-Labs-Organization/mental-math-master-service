/*
  Warnings:

  - Changed the type of `role` on the `vendor_users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VENDOR', 'MANAGER', 'STAFF');

-- AlterTable
ALTER TABLE "vendor_users" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- DropEnum
DROP TYPE "UserRole";
