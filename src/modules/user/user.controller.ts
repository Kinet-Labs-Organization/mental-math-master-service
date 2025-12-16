import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUser } from "@/src/auth/decorator";
import { JwtGuard } from "@/src/auth/guard";
import { AccessTokenDto } from "@/src/auth/dto";

@UseGuards(JwtGuard)
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get("me")
  async me(@GetUser() user: AccessTokenDto) {
    return user;
  }

  ////

  @UseGuards(JwtGuard)
  @Get('progressReports')
  async progressReports() {
    return this.userService.progressReports();
  }

  @UseGuards(JwtGuard)
  @Get('practiceGames')
  async practiceGames() {
    return this.userService.practiceGames();
  }

  @UseGuards(JwtGuard)
  @Get('tournamentGames')
  async tournamentGames() {
    return this.userService.tournamentGames();
  }

  // @Post('login')
  // async login(
  //   @Body() { email, password }: { email: string; password: string },
  // ) {
  //   return this.userService.login({ email, password });
  // }

  // @UseGuards(JwtGuard)
  // @Get('me')
  // async me(@Request() req: any) {
  //   return req.user;
  // }

  @UseGuards(JwtGuard)
  @Get('flashGame/:id')
  async flashGame(@Param('id') id: string) {
    return this.userService.flashGame(id);
  }
}
