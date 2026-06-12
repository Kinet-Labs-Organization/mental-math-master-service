import { Module } from "@nestjs/common";
import { GenericController } from "./generic.controller";
import { GenericService } from "./generic.service";
import { PrismaModule } from "@/src/database/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [GenericController],
  providers: [GenericService],
})
export class GenericModule {}
