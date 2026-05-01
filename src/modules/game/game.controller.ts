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
import { AccessTokenDto } from "@/src/auth/dto";
import { FlashGameReportPayloadDto } from "@/src/interfaces/reports";

@Controller("game")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get("gameLevels/:game_level")
  gameLevels(@Param("game_level") gameLevel: string) {
    return this.gameService.gameLevels(gameLevel);
  }

  @Subscriptions("PRO", "TRIAL")
  @UseGuards(FirebaseAuthGuard, SubscriptionGuard)
  @Post("fetchGame")
  fetchGame(@Body() data: Parameters<GameService["fetchGame"]>[0]) {
    return this.gameService.fetchGame(data);
  }

  @Subscriptions("PRO", "TRIAL")
  @UseGuards(FirebaseAuthGuard, SubscriptionGuard)
  @Post("fetchCustomGame")
  fetchCustomGame(@Body() data: Parameters<GameService["fetchCustomGame"]>[0]) {
    return this.gameService.fetchCustomGame(data);
  }

  @Subscriptions("PRO", "TRIAL")
  @UseGuards(FirebaseAuthGuard, SubscriptionGuard)
  @Post("saveGame")
  async saveGame(
    @GetUser() user: AccessTokenDto,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    data: FlashGameReportPayloadDto,
  ) {
    return this.gameService.saveGame(user, data);
  }
}
