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
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtGuard)
  @Get("me")
  async me(@GetUser() user: AccessTokenDto) {
    return user;
  }

  @Post("userSync")
  userSync(@Body(ValidationPipe) dto: any) {
    return this.userService.userSync(dto);
  }

  // Used in progress route
  @UseGuards(JwtGuard)
  @Get("basicReport")
  async basicReport() {
    return this.userService.basicReport();
  }

  // Used in progress route
  @UseGuards(JwtGuard)
  @Get("progressReport")
  async progressReport() {
    return this.userService.progressReport();
  }

  // Used in progress route
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
