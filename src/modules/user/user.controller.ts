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
import { GetUser, Subscriptions } from "@/src/auth/decorator";
import { FirebaseAuthGuard, JwtGuard, SubscriptionGuard } from "@/src/auth/guard";
import { AccessTokenDto } from "@/src/auth/dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(FirebaseAuthGuard)
  @Get("me")
  async me(@GetUser() user: AccessTokenDto) {
    return user;
  }

  @Post("userSync")
  userSync(@Body(ValidationPipe) dto: any) {
    return this.userService.userSync(dto);
  }

  // Used in progress route
  // @UseGuards(JwtGuard)
  @UseGuards(FirebaseAuthGuard)
  @Get("basicReport")
  async basicReport(@GetUser("email") email: string) {
    return this.userService.basicReport(email);
  }

  // Used in progress route
  // @UseGuards(JwtGuard)
  @UseGuards(FirebaseAuthGuard)
  @Get("progressReport")
  async progressReport(@GetUser("email") email: string) {
    return this.userService.progressReport(email);
  }

  // Used in progress route
  // @UseGuards(JwtGuard)
  @UseGuards(FirebaseAuthGuard)
  @Get("activities")
  async activities(
    @GetUser("email") email: string,
    @Query("position") position: string,
    @Query("length") length: string,
  ) {
    return this.userService.activities(email, position, length);
  }

  // @UseGuards(JwtGuard)
  @Get("leaderBoardData")
  async leaderBoardData() {
    return this.userService.leaderBoardData();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("profile")
  async profileData(@GetUser("email") email: string) {
    return this.userService.profileData(email);
  }

  // @UseGuards(JwtGuard)
  @Get("settingsData")
  async settingsData() {
    return this.userService.settingsData();
  }

  // @UseGuards(JwtGuard)
  @Put("toggleSoundEffect")
  async toggleSoundEffect() {
    return this.userService.toggleSoundEffect();
  }

  // @UseGuards(JwtGuard)
  @Put("toggleNotification")
  async toggleNotification() {
    return this.userService.toggleNotification();
  }

  // @UseGuards(JwtGuard)
  @Get("notifications")
  async notifications(@Query("recentMax") recentMax: number) {
    return this.userService.notifications(recentMax);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("achievements")
  async achievements(@GetUser("email") email: string) {
    return this.userService.achievements(email);
  }

  // @UseGuards(JwtGuard)
  @Put("clearData")
  async clearData() {
    return this.userService.clearData();
  }
}
