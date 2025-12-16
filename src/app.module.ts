import { Module } from "@nestjs/common";
import { UserModule } from "@/src/modules/user/user.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { WinstonModule } from "nest-winston";
import { WinstonOptions } from "@/src/app-config/winston.config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerOption } from "./app-config/throttler.config";
import { AppController } from "./app.controller";

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    WinstonModule.forRoot(WinstonOptions),
    ThrottlerModule.forRoot({
      throttlers: ThrottlerOption,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
