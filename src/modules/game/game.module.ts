import { Module } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameController } from "./game.controller";
import { PrismaModule } from "@/src/database/prisma/prisma.module";
import { UserModule } from "@/src/modules/user/user.module";
import { FirebaseAuthGuard, SubscriptionGuard } from "@/src/auth/guard";

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [GameController],
  providers: [GameService, FirebaseAuthGuard, SubscriptionGuard],
})
export class GameModule {}
