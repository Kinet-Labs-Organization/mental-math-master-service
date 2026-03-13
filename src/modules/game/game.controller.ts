import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { GameService } from "./game.service";
import { FirebaseAuthGuard, SubscriptionGuard } from "@/src/auth/guard";
import { Subscriptions } from "@/src/auth/decorator";

@Controller("game")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get("gameLevels/:game_level")
  async gameLevels(@Param("game_level") gameLevel: string) {
    return this.gameService.gameLevels(gameLevel);
  }

  @Subscriptions("PRO", "FREE")
  @UseGuards(FirebaseAuthGuard, SubscriptionGuard)
  @Post("fetchGame")
  async fetchGame(@Body() data: string) {
    return this.gameService.fetchGame(data);
  }

  @Subscriptions("PRO")
  @UseGuards(FirebaseAuthGuard, SubscriptionGuard)
  @Post("fetchCustomGame")
  async fetchCustomGame(@Body() data: string) {
    return this.gameService.fetchCustomGame(data);
  }
}
