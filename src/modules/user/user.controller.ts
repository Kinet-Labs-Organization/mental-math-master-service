import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUser } from "@/src/auth/decorator";
import { JwtGuard } from "@/src/auth/guard";
import { AccessTokenDto } from "@/src/auth/dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get("me")
  async me(@GetUser() user: AccessTokenDto) {
    return user;
  }

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
  @Get("activities")
  async activities(@Query("position") position: string) {
    return this.userService.activities(position);
  }

  @UseGuards(JwtGuard)
  @Get("leaderBoardData")
  async leaderBoardData() {
    return this.userService.leaderBoardData();
  }

  @UseGuards(JwtGuard)
  @Get("profileData")
  async profileData() {
    return this.userService.profileData();
  }

  @UseGuards(JwtGuard)
  @Get("settingsData")
  async settingsData() {
    return this.userService.settingsData();
  }

  @UseGuards(JwtGuard)
  @Put("toggleSoundEffect")
  async toggleSoundEffect() {
    return this.userService.toggleSoundEffect();
  }

  @UseGuards(JwtGuard)
  @Put("toggleNotification")
  async toggleNotification() {
    return this.userService.toggleNotification();
  }

  @UseGuards(JwtGuard)
  @Put("clearData")
  async clearData() {
    return this.userService.clearData();
  }
}
