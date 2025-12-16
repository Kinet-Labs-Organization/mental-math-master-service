import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy";
import { PrismaModule } from "@/src/database/prisma/prisma.module";
import { UserModule } from "@/src/modules/user/user.module";

@Module({
  imports: [JwtModule.register({}), PrismaModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
