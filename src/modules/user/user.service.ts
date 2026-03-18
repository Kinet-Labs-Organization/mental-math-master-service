import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../../database/prisma/prisma.service";
import { PROFILE, SETTINGS, FAQ, BLOGS, NOTIFICATIONS, ACHIEVEMENTS } from "@/src/utils/mock";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as games from "@/src/utils/gameConfig";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

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
      return { message: "User synchronized successfully" };
    } catch (error) {
      if(error instanceof UnprocessableEntityException && error.message === 'Email already exists') {
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
      achievements: []
    };
  }

  async progressReport(email: string) {
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

    return {
      performanceTrend,
      aiSuggestions: [
        "Practice subtraction more",
        "Try timed challenges",
      ],
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

    const activities = await this.prisma.gameActivity.findMany({
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
    });

    return activities.map((activity) => {
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
  }

  async leaderBoardData() {
    return {
      leaderBoard: [],
    };
  }

  async profileData() {
    return PROFILE
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

  async achievements() {
    const myAchievements = ACHIEVEMENTS.achievements.map((achievement) => {
      return { ...achievement, unlocked: false };
    });
    return myAchievements
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
