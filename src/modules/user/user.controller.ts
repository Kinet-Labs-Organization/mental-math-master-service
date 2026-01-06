import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUser } from "@/src/auth/decorator";
import { JwtGuard } from "@/src/auth/guard";
import { AccessTokenDto, UserSignupDTO } from "@/src/auth/dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get("me")
  async me(@GetUser() user: AccessTokenDto) {
    return user;
  }

  ////

  @Post("userSync")
  userSync(@Body(ValidationPipe) dto: any) {
    return this.userService.userSync(dto);
  }

  @UseGuards(JwtGuard)
  @Get("progressReports")
  async progressReports() {
    return this.userService.progressReports();
  }

  @UseGuards(JwtGuard)
  @Get("practiceGames")
  async practiceGames() {
    return this.userService.practiceGames();
  }

  @UseGuards(JwtGuard)
  @Get("gameLevels/:game_level")
  async gameLevels(@Param("game_level") gameLevel: string) {
    return this.userService.gameLevels(gameLevel);
  }

  // @UseGuards(JwtGuard)
  // @Get("fetchGame/:game/:level/:id")
  // async fetchGame(@Param("game") game: string, @Param("level") level: string, @Param("id") id: string) {
  //   return this.userService.fetchGame(game, level, id);
  // }

  @UseGuards(JwtGuard)
  @Get("fetchGame/:id")
  async fetchGame(@Param("id") id: string) {
    return this.userService.fetchGame(id);
  }

  @UseGuards(JwtGuard)
  @Get("flashGame/:id")
  async flashGame(@Param("id") id: string) {
    return this.userService.flashGame(id);
  }

  @Get("health")
  async health() {
    return { status: "healthy" };
  }
}
