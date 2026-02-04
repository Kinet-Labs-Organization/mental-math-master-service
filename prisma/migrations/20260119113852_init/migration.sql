-- CreateEnum
CREATE TYPE "Achievement" AS ENUM ('FIRST_GAME', 'STREAK_10', 'ACCURACY_90', 'SPEED_DEMON', 'MATH_MASTER', 'PERFECT_SCORE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "achievements" "Achievement"[],
ADD COLUMN     "country" TEXT;

-- CreateTable
CREATE TABLE "Notifications" (
    "id" SERIAL NOT NULL,
    "notificationId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "wrongAnswers" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
