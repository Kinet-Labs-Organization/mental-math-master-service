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

  @UseGuards(FirebaseAuthGuard)
  @Get("basicReport")
  async basicReport(@GetUser("email") email: string) {
    return this.userService.basicReport(email);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("progressReport")
  async progressReport(@GetUser("email") email: string) {
    return this.userService.progressReport(email);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("activities")
  async activities(
    @GetUser("email") email: string,
    @Query("position") position: string,
    @Query("length") length: string,
  ) {
    return this.userService.activities(email, position, length);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("leaderBoardData")
  async leaderBoardData() {
    return this.userService.leaderBoardData();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("profile")
  async profileData(@GetUser("email") email: string) {
    return this.userService.profileData(email);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("settingsData")
  async settingsData(@GetUser("email") email: string) {
    return this.userService.settingsData(email);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post("updateSettings")
  async updateSettings(
    @GetUser("email") email: string,
    @Body(ValidationPipe) payload: any,
  ) {
    return this.userService.updateSettings(email, payload);
  }

  //
  @UseGuards(FirebaseAuthGuard)
  @Get("notifications")
  async notifications(@Query("recentMax") recentMax: number) {
    return this.userService.notifications(recentMax);
  }

  @UseGuards(FirebaseAuthGuard, SubscriptionGuard)
  @Get("achievements")
  async achievements(@GetUser("email") email: string) {
    return this.userService.achievements(email);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post("upgrade")
  async upgrade(
    @GetUser("email") email: string,
    @GetUser("uid") uid: string,
    @Body(ValidationPipe) payload: { term: "d7" | "d30" | "d365" },
  ) {
    return this.userService.upgrade(email, uid, payload);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post("unsubscribe")
  async unsubscribe(
    @GetUser("email") email: string,
    @GetUser("uid") uid: string,
  ) {
    return this.userService.unsubscribe(email, uid);
  }

  //
  @UseGuards(FirebaseAuthGuard)
  @Put("clearData")
  async clearData() {
    // Error: This endpoint is for testing purposes only and should not be used in production
    return this.userService.clearData();
  }
}
