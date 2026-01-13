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
import { JwtGuard } from "@/src/auth/guard";

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) { }

  @UseGuards(JwtGuard)
  @Get("gameLevels/:game_level")
  async gameLevels(@Param("game_level") gameLevel: string) {
    return this.gameService.gameLevels(gameLevel);
  }

  @UseGuards(JwtGuard)
  @Post("fetchGame")
  async fetchGame(@Body() data: string){
    return this.gameService.fetchGame(data);
  }

  @UseGuards(JwtGuard)
  @Post("fetchCustomGame")
  async fetchCustomGame(@Body() data: string) {
    return this.gameService.fetchCustomGame(data);
  }

}
