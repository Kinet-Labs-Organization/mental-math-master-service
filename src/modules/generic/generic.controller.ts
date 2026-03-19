import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { GetUser } from "@/src/auth/decorator";
import { FirebaseAuthGuard } from "@/src/auth/guard";
import { GenericService } from "./generic.service";

@Controller("generic")
export class GenericController {
  constructor(private readonly genericService: GenericService) {}

  // @UseGuards(JwtGuard)
  @Get("faqs")
  async faqs() {
    return this.genericService.faqs();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("leaderboard")
  async leaderboard(@GetUser("email") email: string) {
    return this.genericService.leaderboard(email);
  }

  // @UseGuards(JwtGuard)
  @Get("blogs")
  async blogs(@Query("recentMax") recentMax: number) {
    return this.genericService.blogs(recentMax);
  }

}
