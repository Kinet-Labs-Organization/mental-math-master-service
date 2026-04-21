import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaModule } from "@/src/database/prisma/prisma.module";
import { QueueManagerProcessor } from "./queue-manager.processor";
import { RC_WEBHOOK_QUEUE_COMMON } from "./constants/queue.constants";

@Module({
  imports: [
    PrismaModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>("REDIS_HOST", "127.0.0.1"),
          port: Number(configService.get<string>("REDIS_PORT", "6379")),
          password:
            configService.get<string>("REDIS_PASSWORD")?.trim() || undefined,
        },
      }),
    }),
    BullModule.registerQueue({
      name: RC_WEBHOOK_QUEUE_COMMON,
    }),
  ],
  providers: [QueueManagerProcessor],
  exports: [BullModule],
})
export class QueueManagerModule {}
