import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { FAQ } from "@/src/utils/mock";
import { PrismaService } from "@/src/database/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  RC_WEBHOOK_QUEUE_CATEGORY_1_JOB,
  RC_WEBHOOK_QUEUE_CATEGORY_2_JOB,
} from "@/src/modules/queue-manager/constants/queue.constants";

@Injectable()
export class GenericService {
  private readonly RANK_THRESHOLD = 10;
  private readonly logger = new Logger(GenericService.name);

  constructor(private readonly prisma: PrismaService) {}

  faqs() {
    return FAQ;
  }

  async leaderboard(email: string) {
    const topReports = await this.prisma.report.findMany({
      take: 10,
      where: {
        score: { gte: this.RANK_THRESHOLD },
      },
      orderBy: [{ score: "desc" }, { accuracy: "desc" }, { updatedAt: "asc" }],
      select: {
        score: true,
        accuracy: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const leaderboard = topReports.map((report, index) => ({
      rank: index + 1,
      score: report.score,
      accuracy: report.accuracy,
      name: report.user?.name ?? "Anonymous",
    }));

    const myReport = await this.prisma.report.findFirst({
      where: { user: { email } },
      select: { score: true, accuracy: true, updatedAt: true },
    });

    let currentUserRank: number | null = null;
    if (myReport && myReport.score >= this.RANK_THRESHOLD) {
      const higherRankedCount = await this.prisma.report.count({
        where: {
          score: { gte: this.RANK_THRESHOLD },
          OR: [
            { score: { gt: myReport.score } },
            { score: myReport.score, accuracy: { gt: myReport.accuracy } },
            {
              score: myReport.score,
              accuracy: myReport.accuracy,
              updatedAt: { lt: myReport.updatedAt },
            },
          ],
        },
      });
      currentUserRank = higherRankedCount + 1;
    }

    return {
      rankThreshold: this.RANK_THRESHOLD,
      leaderboard,
      currentUserRank,
    };
  }

  async blogs(recentMax: number) {
    const take =
      Number.isFinite(Number(recentMax)) && Number(recentMax) > 0
        ? Number(recentMax)
        : 100;

    return this.prisma.blogs.findMany({
      take,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      select: {
        brief: true,
        icon: true,
        image: true,
        link: true,
        read: true,
        title: true,
      },
    });
  }

  async onPurchase_rc_production_webhook(payload: any) {
    return this.queueManagerEntries(payload, RC_WEBHOOK_QUEUE_CATEGORY_1_JOB);
  }

  async onExpire_rc_production_webhook(payload: any) {
    return this.queueManagerEntries(
      payload,
      RC_WEBHOOK_QUEUE_CATEGORY_2_JOB,
      "PRODUCTION",
    );
  }

  async onPurchase_rc_sandbox_webhook(payload: any) {
    return this.queueManagerEntries(payload, RC_WEBHOOK_QUEUE_CATEGORY_1_JOB);
  }

  async onExpire_rc_sandbox_webhook(payload: any) {
    return this.queueManagerEntries(payload, RC_WEBHOOK_QUEUE_CATEGORY_2_JOB);
  }

  async queueManagerEntries(
    payload: any,
    queueName: string,
    environment: "PRODUCTION" | "SANDBOX" = "SANDBOX",
  ) {
    const message = JSON.stringify(payload ?? {});
    this.logger.log(message);
    const payloadId = payload?.id;

    if (!payloadId) {
      throw new BadRequestException("RevenueCat webhook payload id is missing");
    }

    let queueManagerEntry: {
      id: number;
      queueId: string;
    };

    try {
      queueManagerEntry = await this.prisma.queueManager.create({
        data: {
          queueId: `${String(payloadId)}:${environment}`,
          queueName,
          message,
          environment,
        },
        select: {
          id: true,
          queueId: true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        this.logger.log(
          `This RevenueCat [${environment}] webhook payload is already queued in QueueManager (queueId=${String(payloadId)})`,
        );

        return {
          message: "Already payload queued",
        };
      }

      throw error;
    }

    this.logger.log(
      `Saved RevenueCat [${environment}] webhook payload in QueueManager (id=${queueManagerEntry.id})`,
    );

    return {
      message: "Payload queued",
    };
  }
}
