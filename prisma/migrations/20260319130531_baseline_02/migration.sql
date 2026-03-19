/*
  Warnings:

  - The values [FIRST_GAME,STREAK_10,ACCURACY_90,SPEED_DEMON,MATH_MASTER,PERFECT_SCORE] on the enum `Achievement` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Achievement_new" AS ENUM ('PLAY_STREAK_3', 'PLAY_STREAK_7', 'PLAY_STREAK_22', 'PLAY_STREAK_30', 'WIN_STREAK_3', 'WIN_STREAK_5', 'WIN_STREAK_10', 'GAMES_TOTAL_25', 'GAMES_TOTAL_50', 'GAMES_TOTAL_100', 'GAMES_TOTAL_200', 'GAMES_TOTAL_500', 'GAMES_TOTAL_1000', 'SCORE_TOTAL_500', 'SCORE_TOTAL_1000', 'SCORE_TOTAL_2000', 'SCORE_TOTAL_5000', 'SCORE_TOTAL_10000');
ALTER TABLE "User" ALTER COLUMN "achievements" TYPE "Achievement_new"[] USING ("achievements"::text::"Achievement_new"[]);
ALTER TYPE "Achievement" RENAME TO "Achievement_old";
ALTER TYPE "Achievement_new" RENAME TO "Achievement";
DROP TYPE "Achievement_old";
COMMIT;
