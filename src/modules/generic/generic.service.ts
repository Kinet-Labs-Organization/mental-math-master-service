import { Injectable } from "@nestjs/common";
import { BLOGS, FAQ, LEADER } from "@/src/utils/mock";

@Injectable()
export class GenericService {
  async faqs() {
    return FAQ;
  }

  async leaderboard() {
    return LEADER;
  }

  async blogs(recentMax: number) {
    return BLOGS.slice(0, recentMax);
  }
}
