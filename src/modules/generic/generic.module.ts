import { Module } from "@nestjs/common";
import { GenericController } from "./generic.controller";
import { GenericService } from "./generic.service";
import { PrismaModule } from "@/src/database/prisma/prisma.module";
import { QueueManagerModule } from "@/src/modules/queue-manager/queue-manager.module";

@Module({
  imports: [PrismaModule, QueueManagerModule],
  controllers: [GenericController],
  providers: [GenericService],
})
export class GenericModule {}
