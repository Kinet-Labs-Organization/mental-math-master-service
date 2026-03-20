-- CreateEnum
CREATE TYPE "SignUpMethod" AS ENUM ('EMAIL', 'GOOGLE', 'FACEBOOK', 'APPLE', 'GMAIL');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SYSTEM', 'ADMIN', 'NORMAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('SUBSCRIBED', 'UNSUBSCRIBED', 'TRIAL');

-- CreateEnum
CREATE TYPE "Achievement" AS ENUM ('PLAY_STREAK_3', 'PLAY_STREAK_7', 'PLAY_STREAK_22', 'PLAY_STREAK_30', 'WIN_STREAK_3', 'WIN_STREAK_5', 'WIN_STREAK_10', 'GAMES_TOTAL_25', 'GAMES_TOTAL_50', 'GAMES_TOTAL_100', 'GAMES_TOTAL_200', 'GAMES_TOTAL_500', 'GAMES_TOTAL_1000', 'SCORE_TOTAL_500', 'SCORE_TOTAL_1000', 'SCORE_TOTAL_2000', 'SCORE_TOTAL_5000', 'SCORE_TOTAL_10000');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "subscribedOn" TIMESTAMP(3),
    "subscriptionExpiration" TIMESTAMP(3),
    "term" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "SignUpMethod" "SignUpMethod" NOT NULL DEFAULT 'GMAIL',
    "country" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "achievements" "Achievement"[],
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameActivity" (
    "id" SERIAL NOT NULL,
    "gameId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "wrongAnswers" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "score" INTEGER,

    CONSTRAINT "GameActivity_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Blogs" (
    "id" SERIAL NOT NULL,
    "brief" TEXT NOT NULL DEFAULT 'New blog post about mental math !',
    "icon" TEXT NOT NULL DEFAULT '📜',
    "image" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d',
    "link" TEXT NOT NULL DEFAULT 'https://www.mentalup.co/blog/mental-math',
    "read" TEXT NOT NULL DEFAULT '8 min',
    "title" TEXT NOT NULL DEFAULT 'What Is Mental Math and Why It Matters',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Report_userId_key" ON "Report"("userId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameActivity" ADD CONSTRAINT "GameActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

