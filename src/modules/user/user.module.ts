import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PrismaModule } from "../../database/prisma/prisma.module";
import { RuleEngineService } from "@/src/services/rule-engine";

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, RuleEngineService],
  exports: [UserService],
})
export class UserModule {}
