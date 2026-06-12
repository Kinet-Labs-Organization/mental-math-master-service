import { Injectable, Logger } from "@nestjs/common";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PrismaService } from "@/src/database/prisma/prisma.service";
import {
  RC_WEBHOOK_QUEUE_COMMON,
  RcWebhookQueueJobData,
} from "@/src/modules/queue-manager/constants/queue.constants";

@Injectable()
@Processor(RC_WEBHOOK_QUEUE_COMMON)
export class QueueManagerProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueManagerProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  process(job: Job<RcWebhookQueueJobData>): Promise<void> {
    this.logger.log(
      `Processed queue message queueId=${String(job.id)} queueName=${job.queueName}`,
    );
    return Promise.resolve();
  }

  @OnWorkerEvent("failed")
  onFailed(
    job: Job<RcWebhookQueueJobData> | undefined,
    error: Error,
  ): Promise<void> {
    if (!job) {
      return Promise.resolve();
    }
    this.logger.error(
      `Queue processing failed queueId=${String(job.id)} queueName=${job.queueName}`,
      error.stack,
    );
    return Promise.resolve();
  }
}
