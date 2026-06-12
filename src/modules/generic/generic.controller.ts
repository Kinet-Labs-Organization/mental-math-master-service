import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { GetUser } from "@/src/auth/decorator";
import { FirebaseAuthGuard } from "@/src/auth/guard";
import { GenericService } from "./generic.service";

@Controller("generic")
export class GenericController {
  constructor(private readonly genericService: GenericService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get("faqs")
  faqs() {
    return this.genericService.faqs();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("leaderboard")
  async leaderboard(@GetUser("email") email: string) {
    return this.genericService.leaderboard(email);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("blogs")
  async blogs(@Query("recentMax") recentMax: number) {
    return this.genericService.blogs(recentMax);
  }

  @Post("onPurchase_rc_production_webhook")
  @HttpCode(200)
  async onPurchase_rc_production_webhook(@Body() payload: any) {
    return this.genericService.onPurchase_rc_production_webhook(payload);
  }

  @Post("onExpire_rc_production_webhook")
  @HttpCode(200)
  async onExpire_rc_production_webhook(@Body() payload: any) {
    return this.genericService.onExpire_rc_production_webhook(payload);
  }

  @Post("onPurchase_rc_sandbox_webhook")
  @HttpCode(200)
  async onPurchase_rc_sandbox_webhook(@Body() payload: any) {
    return this.genericService.onPurchase_rc_sandbox_webhook(payload);
  }

  @Post("onExpire_rc_sandbox_webhook")
  @HttpCode(200)
  async onExpire_rc_sandbox_webhook(@Body() payload: any) {
    return this.genericService.onExpire_rc_sandbox_webhook(payload);
  }
}
