import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { GameService } from "./game.service";
import { FirebaseAuthGuard, SubscriptionGuard } from "@/src/auth/guard";
import { GetUser, Subscriptions } from "@/src/auth/decorator";
import { FlashGameReportPayloadDto } from "@/src/interfaces/reports";
import { User } from "@prisma/client";

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

  @Subscriptions("PRO", "FREE")
  @UseGuards(FirebaseAuthGuard, SubscriptionGuard)
  @Post("flashReport")
  async flashReport(
    @GetUser() user: any,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    data: FlashGameReportPayloadDto,
  ) {
    return this.gameService.saveFlashGameReport(user, data);
  }
}
