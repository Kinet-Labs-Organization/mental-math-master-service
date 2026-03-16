import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, PrismaClient, User } from "@prisma/client";
import * as games from "@/src/utils/gameConfig";
import { PrismaService } from "@/src/database/prisma/prisma.service";
import { FlashGameReportPayloadDto } from "@/src/interfaces/reports";

interface FlashReportSummary {
  gamesPlayed: number;
  accuracy: number;
  streak: number;
  score: number;
}

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

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
  
  async saveFlashGameReport(user: any, payload: FlashGameReportPayloadDto) {
    if (!user?.email) {
      throw new BadRequestException("Authenticated user email is required");
    }

    return this.prisma.$transaction(async (tx) => {
      const appUser = await this.getOrCreateUser(tx, user.email);
      const activity = await this.createFlashGameActivity(tx, appUser, payload);
      const summary = await this.calculateFlashReportSummary(tx, appUser);
      const report = await this.updateUserReport(tx, appUser, summary);

      return {
        message: "Flash game report saved successfully",
        activityId: activity.id,
        // report,
      };
    });
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

  private async createFlashGameActivity(
    tx: PrismaTransactionClient,
    user: User,
    payload: FlashGameReportPayloadDto,
  ) {
    return tx.gameActivity.create({
      data: {
        gameId: payload.gameId,
        gameType: payload.gameMode,
        correctAnswers: payload.correctAnswerGiven,
        wrongAnswers: payload.wrongAnswerGiven,
        playedAt: new Date(payload.answeredAt),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  private async calculateFlashReportSummary(
    tx: PrismaTransactionClient,
    user: User,
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

    const totalCorrectAnswers = aggregates._sum.correctAnswers ?? 0;
    const totalWrongAnswers = aggregates._sum.wrongAnswers ?? 0;
    const totalAttempts = totalCorrectAnswers + totalWrongAnswers;
    const accuracy =
      totalAttempts === 0
        ? 0
        : Number(((totalCorrectAnswers / totalAttempts) * 100).toFixed(2));

    let currentStreak = 0;
    for (const recentActivity of recentActivities) {
      if (recentActivity.correctAnswers > recentActivity.wrongAnswers) {
        currentStreak += 1;
        continue;
      }
      break;
    }

    return {
      gamesPlayed: aggregates._count._all,
      accuracy,
      streak: currentStreak,
      score: totalCorrectAnswers,
    };
  }

  private async updateUserReport(
    tx: PrismaTransactionClient,
    user: User,
    summary: FlashReportSummary,
  ) {
    return tx.report.upsert({
      where: { userId: user.id },
      update: {
        gamesPlayed: summary.gamesPlayed,
        accuracy: summary.accuracy,
        streak: summary.streak,
        score: summary.score,
      },
      create: {
        gamesPlayed: summary.gamesPlayed,
        accuracy: summary.accuracy,
        streak: summary.streak,
        score: summary.score,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }
}

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
