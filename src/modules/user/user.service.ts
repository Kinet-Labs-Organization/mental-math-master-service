import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../../database/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as games from "@/src/utils/gameConfig";
import { RuleEngineService } from "@/src/services/rule-engine";
import * as admin from "firebase-admin";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleEngineService: RuleEngineService,
  ) {}

  // Un-used because users are created by Firebase Authentication trigger and synced to local database in userSync method, but keep this for now for better separation of concerns and future use if needed
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }
    return user;
  }

  // Un-used because users are created by Firebase Authentication trigger and synced to local database in userSync method, but keep this for now for better separation of concerns and future use if needed
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
      // const subscribedOn = new Date();
      // const subscriptionExpiration = new Date(subscribedOn);
      // subscriptionExpiration.setDate(subscriptionExpiration.getDate() + 7);
      const createUserInput: Prisma.UserCreateInput = {
        email: signupDto.email,
        name: signupDto.name || this.generateCreativeUsername(),
      };
      const user = await this.createUser(createUserInput);
      if (!user) {
        throw new ForbiddenException("User creation failed");
      }
      // const firebaseUser = await admin.auth().getUserByEmail(signupDto.email);
      // await this.syncSubscriptionClaimsForFirebaseUser(firebaseUser.uid, {
      //   status: "UNSUBSCRIBED",
      // });
      return { message: "User synchronized successfully" };
    } catch (error) {
      if (
        error instanceof UnprocessableEntityException &&
        error.message === "Email already exists"
      ) {
        // Add this code back when need to sync existing user's subscription status to Firebase claims during login/signup
        // try {
        //   const firebaseUser = await admin.auth().getUserByEmail(signupDto.email);
        //   const dbUser = await this.prisma.user.findUnique({
        //     where: { email: signupDto.email },
        //     select: {
        //       status: true,
        //       term: true,
        //       subscriptionExpiration: true,
        //     },
        //   });
        //   if (dbUser?.status) {
        //     await this.syncSubscriptionClaimsForFirebaseUser(firebaseUser.uid, {
        //       status: dbUser.status as "PRO" | "TRIAL" | "UNSUBSCRIBED",
        //       term: (dbUser.term as "d7" | "d30" | "d365" | null) ?? null,
        //       subscriptionExpiration: dbUser.subscriptionExpiration ?? null,
        //     });
        //   }
        // } catch (claimSyncError) {
        //   console.warn("Failed to sync Firebase custom claims during userSync:", claimSyncError);
        // }
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
      achievements: user.report?.achievements ?? [],
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

    const pos = Number.isNaN(parseInt(position, 10))
      ? 0
      : parseInt(position, 10);
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
        lastSubscriptionStatus: true,
        term: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    let planNameToShow: string = "";
    const previousStatus: string =
      (user.lastSubscriptionStatus as string) || "TRIAL";
    if ((user.status as string) === "PRO") {
      planNameToShow = "Pro Plan";
    } else if ((user.status as string) === "TRIAL") {
      planNameToShow = "Free Trial";
    } else if ((user.status as string) === "UNSUBSCRIBED") {
      if (previousStatus === "PRO") {
        planNameToShow = "Plan Expired";
      } else if (previousStatus === "TRIAL") {
        planNameToShow = "Trial Expired";
      } else {
        planNameToShow = "No Plan";
      }
    }

    return {
      name: user.name ?? "Anonymous",
      email: user.email,
      subscribedOn: user.subscribedOn ?? user.subscriptionExpiration ?? null,
      plan: {
        planId: user.status,
        planNameToShow: planNameToShow,
        planAction:
          (user.status as string) === "UNSUBSCRIBED" ||
          (user.status as string) === "TRIAL"
            ? "UPGRADE"
            : "",
      },
      createdAt: user.createdAt,
    };
  }

  async settingsData(email: string) {
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

    return this.prisma.settings.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        user: {
          connect: { id: user.id },
        },
      },
      select: {
        soundEffect: true,
        notifications: true,
        newsLetter: true,
      },
    });
  }

  async updateSettings(email: string, payload: any) {
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

    const updateData: {
      soundEffect?: boolean;
      notifications?: boolean;
      newsLetter?: boolean;
    } = {};

    if (typeof payload?.soundEffect === "boolean") {
      updateData.soundEffect = payload.soundEffect;
    }
    if (typeof payload?.sound === "boolean") {
      updateData.soundEffect = payload.sound;
    }
    if (typeof payload?.notifications === "boolean") {
      updateData.notifications = payload.notifications;
    }
    if (typeof payload?.notification === "boolean") {
      updateData.notifications = payload.notification;
    }
    if (typeof payload?.newsLetter === "boolean") {
      updateData.newsLetter = payload.newsLetter;
    }
    if (typeof payload?.newsletter === "boolean") {
      updateData.newsLetter = payload.newsletter;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException("No valid settings fields provided");
    }

    return this.prisma.settings.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        ...updateData,
        user: {
          connect: { id: user.id },
        },
      },
      select: {
        soundEffect: true,
        notifications: true,
        newsLetter: true,
      },
    });
  }

  async notifications(email: string, recentMax: number) {
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

    const take =
      Number.isFinite(Number(recentMax)) && Number(recentMax) > 0
        ? Number(recentMax)
        : 20;

    const [rows, total, unread] = await Promise.all([
      this.prisma.userToNotification.findMany({
        where: { userId: user.id },
        orderBy: [{ notification: { createdAt: "desc" } }],
        take,
        select: {
          unread: true,
          notification: {
            select: {
              id: true,
              title: true,
              details: true,
              iconId: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.userToNotification.count({
        where: { userId: user.id },
      }),
      this.prisma.userToNotification.count({
        where: { userId: user.id, unread: true },
      }),
    ]);

    const notifications = rows.map((row) => ({
      id: row.notification.id,
      title: row.notification.title,
      description: row.notification.details,
      icon: row.notification.iconId ? String(row.notification.iconId) : "🔔",
      read: !row.unread,
      time: row.notification.createdAt.toISOString(),
    }));

    return {
      notifications,
      total,
      unread,
    };
  }

  async markNotificationRead(email: string, notificationId: number) {
    if (!email) {
      throw new NotFoundException("Authenticated user email not found");
    }
    if (!notificationId || Number.isNaN(Number(notificationId))) {
      throw new BadRequestException("notificationId is required");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const updated = await this.prisma.userToNotification.updateMany({
      where: {
        userId: user.id,
        notificationId: Number(notificationId),
      },
      data: {
        unread: false,
      },
    });

    if (updated.count === 0) {
      throw new NotFoundException("Notification not found for current user");
    }

    return {
      message: "Notification marked as read",
    };
  }

  async createNotificationAsAdmin(
    email: string,
    uid: string,
    role: string | undefined,
    payload: {
      title: string;
      details: string;
      iconId?: number;
      userIds?: number[];
      broadcast?: boolean;
    },
  ) {
    if (!email || !uid) {
      throw new NotFoundException("Authenticated admin context not found");
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin =
      role === "ADMIN" || adminEmails.includes(email.toLowerCase());

    if (!isAdmin) {
      throw new ForbiddenException("Only admin can create notifications");
    }

    if (!payload?.title?.trim() || !payload?.details?.trim()) {
      throw new BadRequestException("title and details are required");
    }

    const targetUserIds = payload.broadcast
      ? undefined
      : Array.isArray(payload.userIds)
        ? payload.userIds.filter((id) => Number.isInteger(id) && id > 0)
        : undefined;

    return this.prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: targetUserIds?.length
          ? { id: { in: targetUserIds } }
          : undefined,
        select: { id: true },
      });

      if (users.length === 0) {
        throw new BadRequestException("No target users found");
      }

      const notification = await tx.notification.create({
        data: {
          title: payload.title.trim(),
          details: payload.details.trim(),
          iconId: payload.iconId ?? null,
        },
        select: {
          id: true,
          title: true,
          details: true,
          iconId: true,
        },
      });

      await tx.userToNotification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          notificationId: notification.id,
        })),
        skipDuplicates: true,
      });

      return {
        message: "Notification created successfully",
        notification,
        recipients: users.length,
      };
    });
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
      (
        games.ACHIEVEMENTS_CRITERIA as Array<{
          id: string;
          name: string;
          description: string;
          icon: string;
        }>
      ).map((achievement) => [
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
      throw new BadRequestException(
        "Invalid term. Allowed values: d7, d30, d365",
      );
    }

    const subscribedOn = new Date();
    const subscriptionExpiration = new Date(subscribedOn);
    subscriptionExpiration.setDate(
      subscriptionExpiration.getDate() + daysToAdd,
    );
    const subscriptionStatus =
      daysToAdd === 7
        ? "TRIAL"
        : daysToAdd === 30 || daysToAdd === 365
          ? "PRO"
          : "UNSUBSCRIBED";

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      // Check existing user and get current subscription status from local database
      const existingUser = await tx.user.findUnique({
        where: { email },
        select: { status: true },
      });

      if (!existingUser) {
        throw new NotFoundException(`No user found for email: ${email}`);
      }

      // Check RevenueCat or other third-party subscription status here if needed and decide whether to allow upgrade or not based on current subscription status in local database and/or third-party source
      // const rcBaseUrl = process.env.REVENUECAT_BASEURL_V2_RESTAPI;
      // const rcProjectId = process.env.REVENUECAT_PROJECTID_RESTAPI;
      // const rcApiKey = process.env.REVENUECAT_API_KEY;
      // const expectedEntitlementId = process.env.REVENUECAT_ENTITLEMENT_ID;

      // if (!rcBaseUrl || !rcProjectId || !rcApiKey || !expectedEntitlementId) {
      //   throw new BadRequestException(
      //     "RevenueCat configuration missing. Please set base URL, project ID, API key, and entitlement ID.",
      //   );
      // }

      // const rcSubscriptionStatus = await axios.get(`${rcBaseUrl}/projects/${rcProjectId}/customers/${email}`, {
      //   headers: {
      //     'Authorization': `Bearer ${rcApiKey}`
      //   }
      // });

      // const activeEntitlement = rcSubscriptionStatus?.data?.active_entitlements?.items?.[0];
      // const activeEntitlementId =
      //   activeEntitlement?.entitlement_id ??
      //   null;

      // if (!activeEntitlement || activeEntitlementId !== expectedEntitlementId) {
      //   throw new ForbiddenException(
      //     `No active entitlement found for ${expectedEntitlementId}.`,
      //   );
      // }

      // Update user subscription status in local database
      const user = await tx.user.update({
        where: { email },
        data: {
          lastSubscriptionStatus: existingUser.status ?? null,
          status: subscriptionStatus,
          term: payload.term,
          subscribedOn,
          subscriptionExpiration,
        },
        select: {
          email: true,
          status: true,
          lastSubscriptionStatus: true,
          term: true,
          subscribedOn: true,
          subscriptionExpiration: true,
        },
      });

      // Sync the new subscription status to Firebase custom claims
      await this.syncSubscriptionClaimsForFirebaseUser(uid, {
        status: subscriptionStatus,
        term: payload.term,
        subscriptionExpiration,
      });

      return user;
    });

    return {
      message: "User upgraded successfully",
      data: updatedUser,
    };
  }

  async syncSubscription(
    email: string,
    uid: string,
    payload: {
      status: "PRO" | "UNSUBSCRIBED";
      subscriptionExpiration?: string | null;
    },
  ) {
    if (!email) {
      throw new NotFoundException("Authenticated user email not found");
    }
    if (!uid) {
      throw new NotFoundException("Authenticated user uid not found");
    }

    const nextStatus = payload?.status;
    if (!["PRO", "UNSUBSCRIBED"].includes(nextStatus)) {
      throw new BadRequestException(
        "Invalid status. Allowed values: PRO, UNSUBSCRIBED",
      );
    }

    const parsedExpiration =
      payload?.subscriptionExpiration != null
        ? new Date(payload.subscriptionExpiration)
        : null;
    const subscriptionExpiration =
      parsedExpiration && !Number.isNaN(parsedExpiration.getTime())
        ? parsedExpiration
        : null;

    const update = await this.updateSubscriptionStateByEmail(
      email,
      nextStatus,
      subscriptionExpiration,
    );
    await this.syncSubscriptionClaimsForFirebaseUser(uid, {
      status: nextStatus,
      term: update.term,
      subscriptionExpiration: update.subscriptionExpiration,
    });

    return {
      message: "Subscription synchronized successfully",
      data: update,
    };
  }

  async unsubscribe(email: string, uid: string) {
    if (!email) {
      throw new NotFoundException("Authenticated user email not found");
    }
    if (!uid) {
      throw new NotFoundException("Authenticated user uid not found");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { status: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: {
        lastSubscriptionStatus: existingUser.status ?? null,
        status: "UNSUBSCRIBED",
        term: null,
        subscribedOn: null,
        subscriptionExpiration: null,
      },
      select: {
        email: true,
        status: true,
        lastSubscriptionStatus: true,
        term: true,
        subscribedOn: true,
        subscriptionExpiration: true,
      },
    });

    await this.syncSubscriptionClaimsForFirebaseUser(uid, {
      status: "UNSUBSCRIBED",
      term: null,
      subscriptionExpiration: null,
    });

    return {
      message: "User unsubscribed successfully",
      data: updatedUser,
    };
  }

  clearData() {
    return {
      message: "User data cleared",
    };
  }

  // async handleRevenueCatWebhook(authorization: string | undefined, payload: any) {
  //   const configuredSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  //   if (configuredSecret) {
  //     const incomingToken = (authorization ?? "").replace(/^Bearer\s+/i, "").trim();
  //     if (!incomingToken || incomingToken !== configuredSecret) {
  //       throw new ForbiddenException("Invalid RevenueCat webhook authorization");
  //     }
  //   }

  //   const event = payload?.event ?? payload;
  //   const eventType = String(event?.type ?? "").toUpperCase();
  //   if (!eventType) {
  //     throw new BadRequestException("Invalid RevenueCat webhook payload: missing event type");
  //   }

  //   const appUserId = String(event?.app_user_id ?? "").trim();
  //   const subscriberEmail =
  //     event?.subscriber_attributes?.$email?.value ||
  //     event?.subscriber_attributes?.email?.value ||
  //     null;
  //   const targetEmail = this.resolveRevenueCatTargetEmail(appUserId, subscriberEmail);
  //   if (!targetEmail) {
  //     return { message: "Webhook received but no target user email resolved", eventType };
  //   }

  //   const expiredEventTypes = new Set([
  //     "EXPIRATION",
  //     "SUBSCRIPTION_EXPIRED",
  //     "SUBSCRIPTION_PAUSED",
  //     "SUBSCRIPTION_REVOKED",
  //   ]);
  //   const activeEventTypes = new Set([
  //     "INITIAL_PURCHASE",
  //     "RENEWAL",
  //     "NON_RENEWING_PURCHASE",
  //     "PRODUCT_CHANGE",
  //     "UNCANCELLATION",
  //     "SUBSCRIPTION_EXTENDED",
  //     "TRANSFER",
  //   ]);

  //   const expirationCandidate =
  //     event?.expiration_at_ms ??
  //     event?.expires_date_ms ??
  //     event?.expiration_at ??
  //     event?.expires_date ??
  //     null;
  //   const parsedExpiration = this.parseRevenueCatExpiration(expirationCandidate);

  //   let nextStatus: "PRO" | "UNSUBSCRIBED" | null = null;
  //   if (expiredEventTypes.has(eventType)) {
  //     nextStatus = "UNSUBSCRIBED";
  //   } else if (activeEventTypes.has(eventType)) {
  //     nextStatus = "PRO";
  //   }

  //   if (!nextStatus) {
  //     return {
  //       message: "Webhook event ignored",
  //       eventType,
  //       targetEmail,
  //     };
  //   }

  //   const update = await this.updateSubscriptionStateByEmail(
  //     targetEmail,
  //     nextStatus,
  //     nextStatus === "PRO" ? parsedExpiration : null,
  //   );

  //   try {
  //     const firebaseUser = await admin.auth().getUserByEmail(targetEmail);
  //     await this.syncSubscriptionClaimsForFirebaseUser(firebaseUser.uid, {
  //       status: nextStatus,
  //       term: update.term,
  //       subscriptionExpiration: update.subscriptionExpiration,
  //     });
  //   } catch (error) {
  //     console.warn("Failed to sync Firebase claims from RevenueCat webhook:", error);
  //   }

  //   return {
  //     message: "Webhook processed successfully",
  //     eventType,
  //     targetEmail,
  //     status: nextStatus,
  //   };
  // }

  // private resolveRevenueCatTargetEmail(appUserId?: string | null, subscriberEmail?: string | null) {
  //   const emailCandidate = (subscriberEmail ?? "").trim();
  //   if (emailCandidate.includes("@")) {
  //     return emailCandidate.toLowerCase();
  //   }

  //   const appUserIdCandidate = (appUserId ?? "").trim();
  //   if (appUserIdCandidate.includes("@")) {
  //     return appUserIdCandidate.toLowerCase();
  //   }

  //   return null;
  // }

  // private parseRevenueCatExpiration(value: unknown): Date | null {
  //   if (value == null) {
  //     return null;
  //   }

  //   if (typeof value === "number") {
  //     const ms = value > 1_000_000_000_000 ? value : value * 1000;
  //     const date = new Date(ms);
  //     return Number.isNaN(date.getTime()) ? null : date;
  //   }

  //   if (typeof value === "string") {
  //     const asNumber = Number(value);
  //     if (!Number.isNaN(asNumber)) {
  //       const ms = asNumber > 1_000_000_000_000 ? asNumber : asNumber * 1000;
  //       const numericDate = new Date(ms);
  //       if (!Number.isNaN(numericDate.getTime())) {
  //         return numericDate;
  //       }
  //     }

  //     const date = new Date(value);
  //     return Number.isNaN(date.getTime()) ? null : date;
  //   }

  //   return null;
  // }

  private inferTermFromExpiration(
    subscriptionExpiration: Date | null,
  ): "d7" | "d30" | "d365" | null {
    if (!subscriptionExpiration) {
      return null;
    }

    const now = Date.now();
    const diffDays = Math.ceil(
      (subscriptionExpiration.getTime() - now) / (1000 * 60 * 60 * 24),
    );
    if (diffDays <= 10) {
      return "d7";
    }
    if (diffDays <= 60) {
      return "d30";
    }
    return "d365";
  }

  private async updateSubscriptionStateByEmail(
    email: string,
    status: "PRO" | "UNSUBSCRIBED",
    subscriptionExpiration: Date | null,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { status: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const nextTerm =
      status === "PRO"
        ? this.inferTermFromExpiration(subscriptionExpiration)
        : null;
    const subscribedOn = status === "PRO" ? new Date() : null;

    return this.prisma.user.update({
      where: { email },
      data: {
        lastSubscriptionStatus: existingUser.status ?? null,
        status,
        term: nextTerm,
        subscribedOn,
        subscriptionExpiration:
          status === "PRO" ? subscriptionExpiration : null,
      },
      select: {
        email: true,
        status: true,
        lastSubscriptionStatus: true,
        term: true,
        subscribedOn: true,
        subscriptionExpiration: true,
      },
    });
  }

  private getGameMetaFromGameId(gameId: string) {
    const [gameType, gameLevel, gameNo] = gameId.split("_");
    const fallbackName = gameType === "CUSTOM" ? "Custom Practice" : gameId;
    const gameConfigKey = `${gameType}_${gameLevel}` as keyof typeof games;
    const gameLevelList = games[gameConfigKey] as
      | Array<{ name: string; icon: string }>
      | undefined;
    const gameIndex = parseInt(gameNo, 10) - 1;
    const gameConfig = gameLevelList?.[gameIndex];

    return {
      name: gameConfig?.name ?? fallbackName,
      icon: Number(gameConfig?.icon ?? 1),
    };
  }
}
