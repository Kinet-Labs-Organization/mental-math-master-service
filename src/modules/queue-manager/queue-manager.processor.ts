import { Injectable, Logger } from "@nestjs/common";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PrismaService } from "@/src/database/prisma/prisma.service";
import {
  RC_WEBHOOK_QUEUE_COMMON,
  RcWebhookQueueJobData,
} from "@/src/modules/queue-manager/constants/queue.constants";
import { QueueManagerStatus } from "@prisma/client";

@Injectable()
@Processor(RC_WEBHOOK_QUEUE_COMMON)
export class QueueManagerProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueManagerProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<RcWebhookQueueJobData>): Promise<void> {
    // await this.prisma.queueManager.upsert({
    //   where: { queueId: String(job.id) },
    //   create: {
    //     queueId: String(job.id),
    //     queueName: job.queueName,
    //     message: job.data.message,
    //     status: QueueManagerStatus.PROCESSED,
    //     attemptsMade: job.attemptsMade,
    //     processedAt: new Date(),
    //   },
    //   update: {
    //     queueName: job.queueName,
    //     message: job.data.message,
    //     status: QueueManagerStatus.PROCESSED,
    //     attemptsMade: job.attemptsMade,
    //     processedAt: new Date(),
    //     errorMessage: null,
    //   },
    // });

    this.logger.log(
      `Processed queue message queueId=${String(job.id)} queueName=${job.queueName}`,
    );
  }

  @OnWorkerEvent("failed")
  async onFailed(
    job: Job<RcWebhookQueueJobData> | undefined,
    error: Error,
  ): Promise<void> {
    if (!job) {
      return;
    }

    // await this.prisma.queueManager.upsert({
    //   where: { queueId: String(job.id) },
    //   create: {
    //     queueId: String(job.id),
    //     queueName: job.queueName,
    //     message: job.data?.message ?? "",
    //     status: QueueManagerStatus.FAILED,
    //     attemptsMade: job.attemptsMade,
    //     errorMessage: error.message,
    //   },
    //   update: {
    //     status: QueueManagerStatus.FAILED,
    //     attemptsMade: job.attemptsMade,
    //     errorMessage: error.message,
    //   },
    // });

    this.logger.error(
      `Queue processing failed queueId=${String(job.id)} queueName=${job.queueName}`,
      error.stack,
    );
  }
}
