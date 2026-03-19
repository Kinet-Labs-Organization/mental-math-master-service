import { Injectable } from "@nestjs/common";
import { BLOGS, FAQ } from "@/src/utils/mock";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class GenericService {
  private readonly prisma = new PrismaClient();

  async faqs() {
    return FAQ;
  }

  async leaderboard() {
    const topReports = await this.prisma.report.findMany({
      take: 10,
      orderBy: [{ score: "desc" }, { accuracy: "desc" }, { updatedAt: "asc" }],
      select: {
        score: true,
        accuracy: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return topReports.map((report, index) => ({
      rank: index + 1,
      score: report.score,
      accuracy: report.accuracy,
      name: report.user?.name ?? "Anonymous",
    }));
  }

  async blogs(recentMax: number) {
    return BLOGS.slice(0, recentMax);
  }

  async systemCall_userSyncFromSupabaseToLocalDB() {
    
  }
}
