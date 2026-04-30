import { Injectable } from "@nestjs/common";
import { Achievement, Prisma, PrismaClient, User } from "@prisma/client";
import * as games from "@/src/utils/gameConfig";
import { PrismaService } from "@/src/database/prisma/prisma.service";
import { FlashGameReportPayloadDto } from "@/src/interfaces/reports";
import { setsAreEqual } from "@/src/utils/utility";

interface FlashReportSummary {
  gamesPlayed: number;
  accuracy: number;
  streak: number;
  score: number;
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

const PLAY_STREAK_ACHIEVEMENT_MAP: Record<string, Achievement> = {
  PLAY_STREAK_3: Achievement.PLAY_STREAK_3,
  PLAY_STREAK_7: Achievement.PLAY_STREAK_7,
  PLAY_STREAK_22: Achievement.PLAY_STREAK_22,
  PLAY_STREAK_30: Achievement.PLAY_STREAK_30,
};

const WIN_STREAK_ACHIEVEMENT_MAP: Record<string, Achievement> = {
  WIN_STREAK_3: Achievement.WIN_STREAK_3,
  WIN_STREAK_5: Achievement.WIN_STREAK_5,
  WIN_STREAK_10: Achievement.WIN_STREAK_10,
};

const SCORE_TOTAL_ACHIEVEMENT_MAP: Record<string, Achievement> = {
  SCORE_TOTAL_500: Achievement.SCORE_TOTAL_500,
  SCORE_TOTAL_1000: Achievement.SCORE_TOTAL_1000,
  SCORE_TOTAL_2000: Achievement.SCORE_TOTAL_2000,
  SCORE_TOTAL_5000: Achievement.SCORE_TOTAL_5000,
  SCORE_TOTAL_10000: Achievement.SCORE_TOTAL_10000,
};

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
      divisorDigits: gameData.divisorDigits || 0,
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
    if (game.operations.length !== 0 && game.operations[0] === "divide") {
      const minDividend = Math.pow(10, game.digitCount - 1);
      const maxDividend = Math.pow(10, game.digitCount) - 1;
      const minDivisor = Math.pow(10, game.divisorDigits - 1);
      const maxDivisor = Math.pow(10, game.divisorDigits) - 1;
      const newNumbers: any[] = [];
      const valueDivident =
        Math.floor(Math.random() * (maxDividend - minDividend + 1)) +
        minDividend;
      newNumbers.push({ value: valueDivident, operation: "" });
      const valueDivisor =
        Math.floor(Math.random() * (maxDivisor - minDivisor + 1)) + minDivisor;
      newNumbers.push({ value: valueDivisor, operation: "divide" });
      return newNumbers;
    } else {
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
        const activity = await this.createGameActivity(tx, appUser, payload);
        const summary = await this.calculateReportSummary(tx, appUser, payload);
        const achievements = await this.markAchievements(
          tx,
          appUser.id,
          summary.gamesPlayed,
          summary.streak,
          summary.score,
          activity.playedAt,
        );
        const report = await this.updateUserReport(
          tx,
          appUser,
          summary,
          achievements,
        );

        return {
          message: "Game saved successfully",
          userId: appUser.id,
          reportId: report.id,
          activityId: activity.id,
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

  private async updateUserReport(
    tx: PrismaTransactionClient,
    user: User,
    summary: FlashReportSummary,
    achievements: Achievement[],
  ) {
    return tx.report.upsert({
      where: { userId: user.id },
      update: {
        gamesPlayed: summary.gamesPlayed,
        accuracy: summary.accuracy,
        streak: summary.streak,
        score: summary.score,
        achievements: {
          set: achievements,
        },
      },
      create: {
        gamesPlayed: summary.gamesPlayed,
        accuracy: summary.accuracy,
        streak: summary.streak,
        score: summary.score,
        achievements: achievements,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
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

  private async createGameActivity(
    tx: PrismaTransactionClient,
    user: User,
    payload: FlashGameReportPayloadDto,
  ) {
    const currentGameScore = this.calculateGameScore(payload);
    return tx.gameActivity.create({
      data: {
        gameId: payload.gameId,
        gameType: payload.gameMode,
        correctAnswers: payload.correctAnswerGiven,
        wrongAnswers: payload.wrongAnswerGiven,
        score: currentGameScore,
        playedAt: new Date(payload.answeredAt),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  private async calculateReportSummary(
    tx: PrismaTransactionClient,
    user: User,
    payload: FlashGameReportPayloadDto,
  ): Promise<FlashReportSummary> {
    const [aggregates, report] = await Promise.all([
      tx.gameActivity.aggregate({
        where: { userId: user.id },
        _count: { _all: true },
        _sum: {
          correctAnswers: true,
          wrongAnswers: true,
          score: true,
        },
      }),
      tx.report.findUnique({
        where: { userId: user.id },
        select: { streak: true },
      }),
    ]);

    const correctAnswers = aggregates._sum.correctAnswers ?? 0;
    const wrongAnswers = aggregates._sum.wrongAnswers ?? 0;
    const totalCorrectAnswers = correctAnswers; // + payload.correctAnswerGiven;
    const totalWrongAnswers = wrongAnswers; // + payload.wrongAnswerGiven;
    const totalAttempts = totalCorrectAnswers + totalWrongAnswers;
    const accuracy =
      totalAttempts === 0
        ? 0
        : Math.ceil(Number((totalCorrectAnswers / totalAttempts) * 100));

    let currentOnGoingStreak = report?.streak ?? 0;
    if (payload.gameMode === "flash") {
      if (payload.correctAnswerGiven > payload.wrongAnswerGiven) {
        currentOnGoingStreak += 1;
      } else {
        currentOnGoingStreak = 0;
      }
    }

    // const [gameType, gameLevel, gameNo] = payload.gameId.split("_");
    // const weightage = games.GAME_METAS.filter((meta) => meta.code === gameType)[0].weightage;
    // const levelMultiplier = parseInt(gameLevel.substring(1));
    // const currentGameScore = payload.correctAnswerGiven * weightage * levelMultiplier;

    return {
      gamesPlayed: aggregates._count._all, // This is total games played including the current game
      accuracy, // This is the updated accuracy including the current game
      streak: currentOnGoingStreak, // This is the count of current ongoing streak including the current game result
      score: aggregates._sum.score ?? 0, // This is the total score for all games played including the current game
    };
  }

  private async markAchievements(
    tx: PrismaTransactionClient,
    userId: number,
    gamesPlayed: number,
    currentStreak: number,
    totalScore: number,
    currentGamePlayedAt: Date,
  ) {
    const currentReport = await tx.report.findUnique({
      where: { userId },
      select: { achievements: true },
    });
    const currentAchievements = currentReport?.achievements ?? [];

    const gamesPlayedAchievements = this.checkTotalGamesPlayedAchievements(
      gamesPlayed,
      currentAchievements,
    );
    const playStreakAchievements = await this.checkPlayStreakAchievements(
      tx,
      userId,
      currentGamePlayedAt,
      currentAchievements,
    );
    const streakAchievements = this.checkWinStreakAchievements(
      currentStreak,
      currentAchievements,
    );
    const totalScoreAchievements = this.checkTotalScoreAchievements(
      totalScore,
      currentAchievements,
    );
    const evaluatedAchievements = Array.from(
      new Set([
        ...gamesPlayedAchievements,
        ...playStreakAchievements,
        ...streakAchievements,
        ...totalScoreAchievements,
      ]),
    );

    // const currentUser = await tx.user.findUnique({
    //   where: { id: user.id },
    //   select: { achievements: true },
    // });
    // const currentAchievements = user.achievements ?? [];
    const allAchievements = Array.from(
      new Set([...currentAchievements, ...evaluatedAchievements]),
    );

    if (allAchievements.length === 0) {
      return [];
    }

    if (setsAreEqual(new Set(allAchievements), new Set(currentAchievements))) {
      return allAchievements;
    }

    // const updatedUser = await tx.user.update({
    //   where: { id: user.id },
    //   data: {
    //     achievements: {
    //       set: allAchievements,
    //     },
    //   },
    //   select: {
    //     achievements: true,
    //   },
    // });

    return allAchievements;
  }

  private checkTotalGamesPlayedAchievements(
    gamesPlayed: number,
    currentAchievements: Achievement[],
  ): Achievement[] {
    const currentAchievementsSet = new Set(currentAchievements);

    return (games.ACHIEVEMENTS_CRITERIA as AchievementCriteriaItem[])
      .filter(
        (achievement) =>
          achievement.category === "games_total" &&
          !currentAchievementsSet.has(
            GAMES_PLAYED_ACHIEVEMENT_MAP[achievement.id],
          ) &&
          typeof achievement.target === "number" &&
          gamesPlayed >= achievement.target,
      )
      .map((achievement) => GAMES_PLAYED_ACHIEVEMENT_MAP[achievement.id])
      .filter((achievement): achievement is Achievement =>
        Boolean(achievement),
      );
  }

  private checkWinStreakAchievements(
    currentStreak: number,
    currentAchievements: Achievement[],
  ): Achievement[] {
    const currentAchievementsSet = new Set(currentAchievements);

    return (games.ACHIEVEMENTS_CRITERIA as AchievementCriteriaItem[])
      .filter((achievement) => {
        return (
          achievement.category === "win_streak" &&
          !currentAchievementsSet.has(
            WIN_STREAK_ACHIEVEMENT_MAP[achievement.id],
          ) &&
          typeof achievement.target === "number" &&
          currentStreak >= achievement.target
        );
      })
      .map((achievement) => WIN_STREAK_ACHIEVEMENT_MAP[achievement.id])
      .filter((achievement): achievement is Achievement =>
        Boolean(achievement),
      );
  }

  private async checkPlayStreakAchievements(
    tx: PrismaTransactionClient,
    userId: number,
    currentGamePlayedAt: Date,
    currentAchievements: Achievement[],
  ): Promise<Achievement[]> {
    const currentAchievementsSet = new Set(currentAchievements);

    const pendingPlayStreakCriteria = (
      games.ACHIEVEMENTS_CRITERIA as AchievementCriteriaItem[]
    )
      .filter(
        (achievement) =>
          achievement.category === "play_streak" &&
          typeof achievement.target === "number",
      )
      .map((achievement) => ({
        target: achievement.target as number,
        mappedAchievement: PLAY_STREAK_ACHIEVEMENT_MAP[achievement.id],
      }))
      .filter(
        (
          achievement,
        ): achievement is { target: number; mappedAchievement: Achievement } =>
          Boolean(achievement.mappedAchievement) &&
          !currentAchievementsSet.has(achievement.mappedAchievement),
      );

    if (pendingPlayStreakCriteria.length === 0) {
      return [];
    }

    const currentDateUtc = new Date(
      Date.UTC(
        currentGamePlayedAt.getUTCFullYear(),
        currentGamePlayedAt.getUTCMonth(),
        currentGamePlayedAt.getUTCDate(),
      ),
    );
    const windowStartUtc = new Date(currentDateUtc);
    windowStartUtc.setUTCDate(windowStartUtc.getUTCDate() - 29);

    const recentActivities = await tx.gameActivity.findMany({
      where: {
        userId,
        playedAt: {
          gte: windowStartUtc,
          lte: currentGamePlayedAt,
        },
      },
      select: {
        playedAt: true,
      },
    });

    const playedDates = new Set(
      recentActivities.map((activity) =>
        activity.playedAt.toISOString().slice(0, 10),
      ),
    );

    let continuousDays = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(currentDateUtc);
      checkDate.setUTCDate(currentDateUtc.getUTCDate() - i);
      const checkKey = checkDate.toISOString().slice(0, 10);
      if (!playedDates.has(checkKey)) {
        break;
      }
      continuousDays += 1;
    }

    return pendingPlayStreakCriteria
      .filter((achievement) => continuousDays >= achievement.target)
      .map((achievement) => achievement.mappedAchievement)
      .filter((achievement): achievement is Achievement =>
        Boolean(achievement),
      );
  }

  private checkTotalScoreAchievements(
    totalScore: number,
    currentAchievements: Achievement[],
  ): Achievement[] {
    const currentAchievementsSet = new Set(currentAchievements);

    return (games.ACHIEVEMENTS_CRITERIA as AchievementCriteriaItem[])
      .filter((achievement) => {
        return (
          achievement.category === "score_total" &&
          !currentAchievementsSet.has(
            SCORE_TOTAL_ACHIEVEMENT_MAP[achievement.id],
          ) &&
          typeof achievement.target === "number" &&
          totalScore >= achievement.target
        );
      })
      .map((achievement) => SCORE_TOTAL_ACHIEVEMENT_MAP[achievement.id])
      .filter((achievement): achievement is Achievement =>
        Boolean(achievement),
      );
  }

  private calculateGameScore(payload: FlashGameReportPayloadDto): number {
    const [gameType, gameLevel, gameNo] = payload.gameId.split("_");
    const weightage = games.GAME_METAS.filter(
      (meta) => meta.code === gameType,
    )[0].weightage;
    const levelMultiplier = parseInt(gameLevel.substring(1));
    const currentGameScore =
      payload.correctAnswerGiven * weightage * levelMultiplier;
    return currentGameScore;
  }
}

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
