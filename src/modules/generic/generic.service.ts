import { Injectable } from "@nestjs/common";
import { FAQ, LEADER } from "@/src/utils/mock";

@Injectable()
export class GenericService {
  async faqs() {
    return FAQ;
  }

  async leaderboard() {
    return LEADER;
  }
}
