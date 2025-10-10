/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `signUpMethod` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `pets` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `pets` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `pets` table. All the data in the column will be lost.
  - Added the required column `updated_date` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_date` to the `pets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `pets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "pets" DROP CONSTRAINT "pets_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "signUpMethod",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sign_up_method" TEXT NOT NULL DEFAULT 'google',
ADD COLUMN     "updated_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "pets" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
