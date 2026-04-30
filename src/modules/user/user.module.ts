import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PrismaModule } from "../../database/prisma/prisma.module";
import { RuleEngineService } from "@/src/services/rule-engine";
import { FirebaseAuthGuard, SubscriptionGuard } from "@/src/auth/guard";

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    RuleEngineService,
    FirebaseAuthGuard,
    SubscriptionGuard,
  ],
  exports: [UserService],
})
export class UserModule {}
