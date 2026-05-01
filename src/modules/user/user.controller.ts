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
import { FirebaseAuthGuard, SubscriptionGuard } from "@/src/auth/guard";
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

  // To check
  @UseGuards(FirebaseAuthGuard)
  @Post("subscription/sync")
  async syncSubscription(
    @GetUser("email") email: string,
    @GetUser("uid") uid: string,
    @Body(ValidationPipe)
    payload: {
      status: "PRO" | "UNSUBSCRIBED";
      subscriptionExpiration?: string | null;
    },
  ) {
    return this.userService.syncSubscription(email, uid, payload);
  }

  // Used by Admin to manually unsubscribe a user, should not be exposed to client
  @UseGuards(FirebaseAuthGuard)
  @Post("unsubscribe")
  async unsubscribe(
    @GetUser("email") email: string,
    @GetUser("uid") uid: string,
  ) {
    return this.userService.unsubscribe(email, uid);
  }

  // @HttpCode(200)
  // @Post("revenuecat/webhook")
  // async revenueCatWebhook(
  //   @Headers("authorization") authorization: string | undefined,
  //   @Body() payload: any,
  // ) {
  //   return this.userService.handleRevenueCatWebhook(authorization, payload);
  // }

  // To implement
  @UseGuards(FirebaseAuthGuard)
  @Put("clearData")
  clearData() {
    // Error: This endpoint is for testing purposes only and should not be used in production
    return this.userService.clearData();
  }
}
