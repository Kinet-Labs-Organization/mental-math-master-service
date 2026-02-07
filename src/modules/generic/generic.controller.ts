import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtGuard } from "@/src/auth/guard";
import { GenericService } from "./generic.service";

@Controller("generic")
export class GenericController {
  constructor(private readonly genericService: GenericService) {}

  @UseGuards(JwtGuard)
  @Get("faqs")
  async faqs() {
    return this.genericService.faqs();
  }

  @UseGuards(JwtGuard)
  @Get("leaderboard")
  async leaderboard() {
    return this.genericService.leaderboard();
  }

  @UseGuards(JwtGuard)
  @Get("blogs")
  async blogs(@Query("recentMax") recentMax: number) {
    return this.genericService.blogs(recentMax);
  }

}
