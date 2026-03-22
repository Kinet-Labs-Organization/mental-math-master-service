import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../../database/prisma/prisma.service";
import { SETTINGS, NOTIFICATIONS } from "@/src/utils/mock";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as games from "@/src/utils/gameConfig";
import { RuleEngineService } from "@/src/services/rule-engine";
import * as admin from "firebase-admin";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleEngineService: RuleEngineService,
  ) { }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }
    return user;
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new UnprocessableEntityException("Email already exists");
    }
    return this.prisma.user.create({ data });
  }

  generateCreativeUsername(): string {
    const colors = [
      "Red",
      "Blue",
      "Green",
      "Golden",
      "Silver",
      "Dark",
      "Bright",
    ];
    const animals = [
      "Panda",
      "Koala",
      "Penguin",
      "Dolphin",
      "Owl",
      "Cat",
      "Dog",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${color} ${animal}`;
  }

  private async syncSubscriptionClaimsForFirebaseUser(
    uid: string,
    data: {
      status: "PRO" | "TRIAL" | "UNSUBSCRIBED";
      term?: "d7" | "d30" | "d365" | null;
      subscriptionExpiration?: Date | null;
    },
  ) {
    const firebaseUser = await admin.auth().getUser(uid);
    const existingClaims = firebaseUser.customClaims ?? {};

    await admin.auth().setCustomUserClaims(uid, {
      ...existingClaims,
      status: data.status,
      term: data.term ?? null,
      subscriptionExpiration: data.subscriptionExpiration
        ? Math.floor(data.subscriptionExpiration.getTime() / 1000)
        : null,
    });
  }

  async userSync(signupDto: any) {
    try {
      const createUserInput: Prisma.UserCreateInput = {
        email: signupDto.email,
        name: signupDto.name || this.generateCreativeUsername(),
        status: "UNSUBSCRIBED",
      };
      const user = await this.createUser(createUserInput);
      if (!user) {
        throw new ForbiddenException("User creation failed");
      }
      const firebaseUser = await admin.auth().getUserByEmail(signupDto.email);
      await this.syncSubscriptionClaimsForFirebaseUser(firebaseUser.uid, {
        status: (user.status as "PRO" | "TRIAL" | "UNSUBSCRIBED") ?? "UNSUBSCRIBED",
        term: (user.term as "d7" | "d30" | "d365" | null) ?? null,
        subscriptionExpiration: user.subscriptionExpiration ?? null,
      });
      return { message: "User synchronized successfully" };
    } catch (error) {
      if (error instanceof UnprocessableEntityException && error.message === 'Email already exists') {
        try {
          const firebaseUser = await admin.auth().getUserByEmail(signupDto.email);
          const dbUser = await this.prisma.user.findUnique({
            where: { email: signupDto.email },
            select: {
              status: true,
              term: true,
              subscriptionExpiration: true,
            },
          });
          if (dbUser?.status) {
            await this.syncSubscriptionClaimsForFirebaseUser(firebaseUser.uid, {
              status: dbUser.status as "PRO" | "TRIAL" | "UNSUBSCRIBED",
              term: (dbUser.term as "d7" | "d30" | "d365" | null) ?? null,
              subscriptionExpiration: dbUser.subscriptionExpiration ?? null,
            });
          }
        } catch (claimSyncError) {
          console.warn("Failed to sync Firebase custom claims during userSync:", claimSyncError);
        }
        return { message: "User synchronized successfully" };
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Credentials taken");
        }
      }
      throw error;
    }
  }

  async basicReport(email: string) {
    if (!email) {
      throw new NotFoundException("Authenticated user email not found");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { report: true },
    });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    return {
      totalSessions: user.report?.gamesPlayed ?? 0,
      accuracyRate: user.report?.accuracy ?? 0,
      currentStreak: user.report?.streak ?? 0,
      score: user.report?.score ?? 0,
      achievements: user.report?.achievements ?? []
    };
  }

  async progressReport(email: string) {
    if (!email) {
      throw new NotFoundException("Authenticated user email not found");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        report: {
          select: {
            gamesPlayed: true,
            accuracy: true,
            streak: true,
            score: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivities = await this.prisma.gameActivity.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        gameId: true,
        gameType: true,
        createdAt: true,
        correctAnswers: true,
        wrongAnswers: true,
      },
    });

    const groupedByDay = new Map<
      string,
      { correctAnswers: number; wrongAnswers: number }
    >();

    for (const activity of recentActivities) {
      const dayKey = activity.createdAt.toISOString().slice(0, 10);
      const daySummary = groupedByDay.get(dayKey) ?? {
        correctAnswers: 0,
        wrongAnswers: 0,
      };

      daySummary.correctAnswers += activity.correctAnswers;
      daySummary.wrongAnswers += activity.wrongAnswers;
      groupedByDay.set(dayKey, daySummary);
    }

    const performanceTrend = Array.from(groupedByDay.values()).map(
      ({ correctAnswers, wrongAnswers }) => {
        const totalAnswers = correctAnswers + wrongAnswers;
        if (totalAnswers === 0) {
          return 0;
        }

        return Math.round((correctAnswers / totalAnswers) * 100);
      },
    );

    const aiSuggestions = this.ruleEngineService.generateSuggestions({
      activities: recentActivities,
      report: {
        totalSessions: user.report?.gamesPlayed ?? 0,
        accuracyRate: user.report?.accuracy ?? 0,
        currentStreak: user.report?.streak ?? 0,
        score: user.report?.score ?? 0,
      },
    });

    return {
      performanceTrend,
      aiSuggestions,
    };
  }

  async activities(email: string, position: string, length: string) {
    if (!email) {
      throw new NotFoundException("Authenticated user email not found");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const pos = Number.isNaN(parseInt(position, 10)) ? 0 : parseInt(position, 10);
    const take = Number.isNaN(parseInt(length, 10)) ? 5 : parseInt(length, 10);

    const [activities, totalCount] = await Promise.all([
      this.prisma.gameActivity.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: pos,
        take,
        select: {
          gameId: true,
          playedAt: true,
          gameType: true,
          correctAnswers: true,
          wrongAnswers: true,
          score: true,
        },
      }),
      this.prisma.gameActivity.count({
        where: {
          userId: user.id,
        },
      }),
    ]);

    const recentActivities = activities.map((activity) => {
      const gameMeta = this.getGameMetaFromGameId(activity.gameId);

      return {
        gameName: gameMeta.name,
        gamePlayedAt: activity.playedAt,
        gameType: activity.gameType,
        icon: gameMeta.icon,
        correctAnswers: activity.correctAnswers,
        wrongAnswers: activity.wrongAnswers,
        score: activity.score ?? 0,
      };
    });
    return {
      recentActivities,
      totalCount,
    };
  }

  async leaderBoardData() {
    return {
      leaderBoard: [],
    };
  }

  async profileData(email: string) {
    if (!email) {
      throw new NotFoundException("Authenticated user email not found");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        name: true,
        email: true,
        status: true,
        subscribedOn: true,
        subscriptionExpiration: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    let planNameToShow: string = "";
    const previousStatus: string = "TRIAL";
    if (user.status as string === "PRO") {
      planNameToShow = "Pro Plan";
    } else if (user.status as string === "TRIAL") {
      planNameToShow = "Free Trial";
    } else if (user.status as string === "UNSUBSCRIBED") {
      if (previousStatus === "PRO") {
        planNameToShow = "Plan Expired";
      } else if (previousStatus === "TRIAL") {
        planNameToShow = "Trial Expired";
      }
    }

    return {
      name: user.name ?? "Anonymous",
      email: user.email,
      subscribedOn: user.subscribedOn ?? user.subscriptionExpiration ?? null,
      plan: {
        planId: user.status,
        planNameToShow: planNameToShow,
        planAction: (user.status as string === "UNSUBSCRIBED" || user.status as string === "TRIAL") ? "UPGRADE" : "",
      },
      createdAt: user.createdAt,
    };
  }

  async settingsData() {
    return SETTINGS;
  }

  async toggleSoundEffect() {
    return {
      message: "Sound effect setting toggled",
    };
  }

  async toggleNotification() {
    return {
      message: "Notification setting toggled",
    };
  }

  async notifications(recentMax: number) {
    return {
      notifications: NOTIFICATIONS.notifications.slice(0, recentMax),
      total: NOTIFICATIONS.total,
      unread: NOTIFICATIONS.unread,
    };
  }

  async achievements(email: string) {
    if (!email) {
      throw new NotFoundException("Authenticated user email not found");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        report: {
          select: {
            achievements: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const currentAchievementIds = user.report?.achievements ?? [];
    if (currentAchievementIds.length === 0) {
      return [];
    }

    const achievementMetaMap = new Map(
      (games.ACHIEVEMENTS_CRITERIA as Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
      }>).map((achievement) => [
        achievement.id,
        {
          title: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
        },
      ]),
    );

    return currentAchievementIds.map((achievementId) => {
      const meta = achievementMetaMap.get(achievementId);
      return {
        id: achievementId,
        title: meta?.title ?? achievementId,
        description: meta?.description ?? "",
        icon: meta?.icon ?? "",
      };
    });
  }

  async upgrade(
    email: string,
    uid: string,
    payload: { term: "d7" | "d30" | "d365" },
  ) {
    if (!email) {
      throw new NotFoundException("Authenticated user email not found");
    }
    if (!uid) {
      throw new NotFoundException("Authenticated user uid not found");
    }

    const validTerms: Record<string, number> = {
      d7: 7,
      d30: 30,
      d365: 365,
    };

    const daysToAdd = validTerms[payload?.term];
    if (!daysToAdd) {
      throw new BadRequestException("Invalid term. Allowed values: d7, d30, d365");
    }

    const subscribedOn = new Date();
    const subscriptionExpiration = new Date(subscribedOn);
    subscriptionExpiration.setDate(subscriptionExpiration.getDate() + daysToAdd);

    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: {
        status: "PRO",
        term: payload.term,
        subscribedOn,
        subscriptionExpiration,
      },
      select: {
        email: true,
        status: true,
        term: true,
        subscribedOn: true,
        subscriptionExpiration: true,
      },
    });

    await this.syncSubscriptionClaimsForFirebaseUser(uid, {
      status: "PRO",
      term: payload.term,
      subscriptionExpiration,
    });

    return {
      message: "User upgraded successfully",
      data: updatedUser,
    };
  }

  async clearData() {
    return {
      message: "User data cleared",
    };
  }

  private getGameMetaFromGameId(gameId: string) {
    const [gameType, gameLevel, gameNo] = gameId.split("_");
    const gameConfigKey = `${gameType}_${gameLevel}` as keyof typeof games;
    const gameLevelList = games[gameConfigKey] as
      | Array<{ name: string; icon: string }>
      | undefined;
    const gameIndex = parseInt(gameNo, 10) - 1;
    const gameConfig = gameLevelList?.[gameIndex];

    return {
      name: gameConfig?.name ?? gameId,
      icon: Number(gameConfig?.icon ?? 0),
    };
  }
}
