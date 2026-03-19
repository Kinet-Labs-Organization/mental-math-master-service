import { Injectable } from "@nestjs/common";
import { BLOGS, FAQ } from "@/src/utils/mock";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class GenericService {
  private readonly prisma = new PrismaClient();
  private readonly RANK_THRESHOLD = 10;

  async faqs() {
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
    return BLOGS.slice(0, recentMax);
  }

  async systemCall_userSyncFromSupabaseToLocalDB() {
    
  }
}
