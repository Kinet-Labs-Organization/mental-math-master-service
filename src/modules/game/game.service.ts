import { BadRequestException, Injectable } from "@nestjs/common";
import { Achievement, Prisma, PrismaClient, User } from "@prisma/client";
import * as games from "@/src/utils/gameConfig";
import { PrismaService } from "@/src/database/prisma/prisma.service";
import { FlashGameReportPayloadDto } from "@/src/interfaces/reports";
import { setsAreEqual } from "@/src/utils/utility";

interface FlashReportSummary {
  gamesPlayedSoFar: number;
  accuracy: number;
  streakCheck: boolean;
  currentGameScore: number;
}

interface AchievementCriteriaItem {
  id: string;
  category: string;
  target: number | string;
}

const GAMES_PLAYED_ACHIEVEMENT_MAP: Record<string, Achievement> = {
  GAMES_TOTAL_25: Achievement.GAMES_TOTAL_25,
  GAMES_TOTAL_50: Achievement.GAMES_TOTAL_50,
  GAMES_TOTAL_100: Achievement.GAMES_TOTAL_100,
  GAMES_TOTAL_200: Achievement.GAMES_TOTAL_200,
  GAMES_TOTAL_500: Achievement.GAMES_TOTAL_500,
  GAMES_TOTAL_1000: Achievement.GAMES_TOTAL_1000,
};

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) { }

  async gameLevels(gameLevel: string) {
    const gameLevelData = games[gameLevel];
    return gameLevelData;
  }

  async fetchGame(gameData: any) {
    const { id, type } = gameData;
    const gameTypeLevel = id.substring(0, id.lastIndexOf("_"));
    const gameId = parseInt(id.substring(id.lastIndexOf("_") + 1));
    const selctedGameConfig = games[gameTypeLevel][gameId - 1];
    let gameDataResponse;
    if (type === "flash") {
      gameDataResponse = this.flashGame(selctedGameConfig);
    } else if (type === "regular") {
      gameDataResponse = this.regularGame(selctedGameConfig);
    }
    return gameDataResponse;
  }

  async fetchCustomGame(gameData: any) {
    const game = {
      digitCount: gameData.digitCount,
      numberCount: gameData.numberCount,
      operations:
        gameData.operations === "add-subtract"
          ? ["add", "subtract"]
          : [gameData.operations],
      gameType: gameData.gameType,
      numberOfQuestions: gameData.numberOfQuestions,
    };
    let gameDataResponse;
    if (gameData.gameType === "flash") {
      gameDataResponse = this.flashGame(game);
    } else {
      gameDataResponse = this.regularGame(game);
    }
    return gameDataResponse;
  }

  flashGame(game: any) {
    const min = Math.pow(10, game.digitCount - 1);
    const max = Math.pow(10, game.digitCount) - 1;
    const newNumbers: any[] = [];
    for (let i = 0; i < game.numberCount; i++) {
      const value = Math.floor(Math.random() * (max - min + 1)) + min;
      const operation =
        game.operations[Math.floor(Math.random() * game.operations.length)];
      newNumbers.push({ value, operation });
    }
    newNumbers[0].operation = "";
    return newNumbers;
  }

  regularGame(game: any) {
    const gameData: any[] = [];
    for (let i = 0; i < game.numberOfQuestions; i++) {
      gameData.push(this.flashGame(game));
    }
    return gameData;
  }

  private generateCreativeUsername(): string {
    const colors = ["Red", "Blue", "Green", "Golden", "Silver", "Bright"];
    const animals = ["Panda", "Koala", "Penguin", "Dolphin", "Owl", "Falcon"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${color} ${animal}`;
  }

  async saveGame(user: any, payload: FlashGameReportPayloadDto) {
    const result = await this.prisma.$transaction(
      async (tx) => {
        const appUser = await this.getOrCreateUser(tx, user.email);
        const summary = await this.calculateReportSummary(tx, appUser, payload);
        const activity = await this.createGameActivity(tx, appUser, summary, payload);
        const report = await this.updateUserReport(tx, appUser, summary);
        const achievements = await this.markAchievements(
          tx,
          appUser.id,
          report.gamesPlayed,
        );

        return {
          message: "Game saved successfully",
          userId: appUser.id,
          gamesPlayed: report.gamesPlayed,
          activityId: activity.id,
          report,
          achievements,
        };
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );

    return {
      message: result.message,
    };
  }

  private async getOrCreateUser(
    tx: PrismaTransactionClient,
    email: string,
  ): Promise<User> {
    return tx.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: this.generateCreativeUsername(),
        status: "UNSUBSCRIBED",
      },
    });
  }

  private async calculateReportSummary(
    tx: PrismaTransactionClient,
    user: User,
    payload: FlashGameReportPayloadDto,
  ): Promise<FlashReportSummary> {
    const [aggregates, recentActivities] = await Promise.all([
      tx.gameActivity.aggregate({
        where: { userId: user.id },
        _count: { _all: true },
        _sum: {
          correctAnswers: true,
          wrongAnswers: true,
        },
      }),
      tx.gameActivity.findMany({
        where: { userId: user.id },
        orderBy: [{ playedAt: "desc" }, { id: "desc" }],
        select: {
          correctAnswers: true,
          wrongAnswers: true,
        },
      }),
    ]);

    const correctAnswers = aggregates._sum.correctAnswers ?? 0;
    const wrongAnswers = aggregates._sum.wrongAnswers ?? 0;
    const totalCorrectAnswers = correctAnswers + payload.correctAnswerGiven;
    const totalWrongAnswers = wrongAnswers + payload.wrongAnswerGiven;
    const totalAttempts = totalCorrectAnswers + totalWrongAnswers;
    const accuracy =
      totalAttempts === 0
        ? 0
        : Math.ceil(Number(((totalCorrectAnswers / totalAttempts) * 100)));

    let currentStreak = false;
    if (payload.gameMode === "flash") {
      if (payload.correctAnswerGiven > payload.wrongAnswerGiven) {
        currentStreak = true;
      }
    }

    const [gameType, gameLevel, gameNo] = payload.gameId.split("_");
    const weightage = games.GAME_METAS.filter((meta) => meta.code === gameType)[0].weightage;
    const levelMultiplier = parseInt(gameLevel.substring(1));
    const currentGameScore = payload.correctAnswerGiven * weightage * levelMultiplier;

    return {
      gamesPlayedSoFar: aggregates._count._all,
      accuracy,
      streakCheck: currentStreak,
      currentGameScore: currentGameScore,
    };
  }

  private async createGameActivity(
    tx: PrismaTransactionClient,
    user: User,
    summary: FlashReportSummary,
    payload: FlashGameReportPayloadDto,
  ) {
    return tx.gameActivity.create({
      data: {
        gameId: payload.gameId,
        gameType: payload.gameMode,
        correctAnswers: payload.correctAnswerGiven,
        wrongAnswers: payload.wrongAnswerGiven,
        score: summary.currentGameScore,
        playedAt: new Date(payload.answeredAt),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  private async updateUserReport(
    tx: PrismaTransactionClient,
    user: User,
    summary: FlashReportSummary,
  ) {
    const existingReport = await tx.report.findUnique({
      where: { userId: user.id },
      select: { streak: true, score: true },
    });

    const gamesPlayed = (summary.gamesPlayedSoFar ?? 0) + 1;
    const streak = summary.streakCheck ? (existingReport?.streak ?? 0) + 1 : 0;
    const score = summary.currentGameScore + (existingReport?.score ?? 0);

    return tx.report.upsert({
      where: { userId: user.id },
      update: {
        gamesPlayed: gamesPlayed,
        accuracy: summary.accuracy,
        streak: streak,
        score: score,
      },
      create: {
        gamesPlayed: gamesPlayed,
        accuracy: summary.accuracy,
        streak: streak,
        score: score,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  private async markAchievements(
    tx: PrismaTransactionClient,
    userId: number,
    gamesPlayed: number,
  ) {
    const gamesPlayedAchievements = this.markGamesPlayedAchievements(gamesPlayed);

    // if (gamesPlayedAchievements.length === 0) {
    //   return [];
    // }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { achievements: true },
    });

    if (!user) {
      throw new BadRequestException("User not found for achievement update");
    }

    const currentAchievements = user.achievements ?? [];
    const allAchievements = Array.from(
      new Set([...currentAchievements, ...gamesPlayedAchievements]),
    );

    if(allAchievements.length === 0) {
      return [];
    }

    if (setsAreEqual(new Set(allAchievements), new Set(currentAchievements))) {
      return allAchievements;
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        achievements: {
          set: allAchievements,
        },
      },
      select: {
        achievements: true,
      },
    });

    return updatedUser.achievements;
  }

  private markGamesPlayedAchievements(gamesPlayed: number): Achievement[] {
    return (games.ACHIEVEMENTS_CRITERIA as AchievementCriteriaItem[])
      .filter(
        (achievement) =>
          achievement.category === "games_total" &&
          typeof achievement.target === "number" &&
          gamesPlayed >= achievement.target,
      )
      .map((achievement) => GAMES_PLAYED_ACHIEVEMENT_MAP[achievement.id])
      .filter((achievement): achievement is Achievement => Boolean(achievement));
  }

}

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
