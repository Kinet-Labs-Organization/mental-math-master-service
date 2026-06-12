import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUser } from "@/src/auth/decorator";
import { FirebaseAuthGuard } from "@/src/auth/guard";
import { AccessTokenDto } from "@/src/auth/dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get("me")
  me(@GetUser() user: AccessTokenDto) {
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

  @UseGuards(FirebaseAuthGuard)
  @Get("notifications")
  async notifications(
    @GetUser("email") email: string,
    @Query("recentMax") recentMax: number,
  ) {
    return this.userService.notifications(email, recentMax);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post("notifications/read")
  async markNotificationRead(
    @GetUser("email") email: string,
    @Body(ValidationPipe) payload: { notificationId: number },
  ) {
    return this.userService.markNotificationRead(email, payload.notificationId);
  }

  // Used by Admin to create notification, should not be exposed to client
  @UseGuards(FirebaseAuthGuard)
  @Post("notifications/create")
  async createNotification(
    @GetUser("email") email: string,
    @GetUser("uid") uid: string,
    @GetUser("role") role: string,
    @Body(ValidationPipe)
    payload: {
      title: string;
      details: string;
      iconId?: number;
      userIds?: number[];
      broadcast?: boolean;
    },
  ) {
    return this.userService.createNotificationAsAdmin(
      email,
      uid,
      role,
      payload,
    );
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("achievements")
  async achievements(@GetUser("email") email: string) {
    return this.userService.achievements(email);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post("upgrade")
  async upgrade(
    @GetUser("email") email: string,
    @GetUser("uid") uid: string,
    @Body(ValidationPipe) term: "d365" | "d30" | "d7",
  ) {
    return this.userService.upgrade(email, uid, term);
  }

  // (used in expired)
  @UseGuards(FirebaseAuthGuard)
  @Post("subscription/sync")
  async syncSubscription(
    @GetUser("email") email: string,
    @GetUser("uid") uid: string,
  ) {
    return this.userService.syncSubscription(email, uid);
  }

  // Used by Admin to manually unsubscribe a user, should not be exposed to client
  // Currently no subscription or un-subscription flows from this backend, all handled through RevenueCat
  // Hence we can not even manually override the subscription status
  @UseGuards(FirebaseAuthGuard)
  @Post("unsubscribe")
  async unsubscribe(
    @GetUser("email") email: string,
    @GetUser("uid") uid: string,
  ) {
    return this.userService.unsubscribe(email, uid);
  }

  // To implement
  @UseGuards(FirebaseAuthGuard)
  @Put("clearData")
  clearData() {
    // Error: This endpoint is for testing purposes only and should not be used in production
    return this.userService.clearData();
  }
}
