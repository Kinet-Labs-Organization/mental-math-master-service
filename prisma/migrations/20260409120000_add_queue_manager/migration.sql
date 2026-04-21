-- CreateEnum
CREATE TYPE "QueueManagerStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "QueueManager" (
    "id" SERIAL NOT NULL,
    "queueId" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "QueueManagerStatus" NOT NULL DEFAULT 'PENDING',
    "attemptsMade" INTEGER NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueManager_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QueueManager_queueId_key" ON "QueueManager"("queueId");

-- CreateIndex
CREATE INDEX "QueueManager_queueName_idx" ON "QueueManager"("queueName");

-- CreateIndex
CREATE INDEX "QueueManager_status_idx" ON "QueueManager"("status");
