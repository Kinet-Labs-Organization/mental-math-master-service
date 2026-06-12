import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SUBSCRIPTION_GUARD_KEY } from "../decorator/subscription-guard.decorator";
import { PrismaService } from "@/src/database/prisma/prisma.service";

// const GUARD_RULE = "BY_CLAIM_TOKEN_ONLY";
const GUARD_RULE: "BY_CLAIM_TOKEN_ONLY" | "BY_DB_INFO_CHECK" =
  "BY_DB_INFO_CHECK";

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    if (GUARD_RULE === "BY_CLAIM_TOKEN_ONLY") {
      return this.guardByClaimTokenOnly(context);
    }

    return this.guardByDBInfoCheck(context);
  }

  private getRequiredSubscriptions(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<string[]>(SUBSCRIPTION_GUARD_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private throwSubscriptionRequired(): never {
    throw new ForbiddenException({
      appMessage: "A valid subscription is required to access this feature.",
      appAction: "UNSUBSCRIBED_USER",
    });
  }

  private guardByClaimTokenOnly(context: ExecutionContext): boolean {
    const requiredSubscription = this.getRequiredSubscriptions(context);
    // PRO, TRIAL, UNSUBSCRIBED - all posibilities
    if (!requiredSubscription || requiredSubscription.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const claimStatus = user?.status as string | undefined;
    const effectiveStatus = claimStatus ?? "UNSUBSCRIBED";

    const hasSubscription = requiredSubscription.includes(effectiveStatus);
    if (!hasSubscription) {
      this.throwSubscriptionRequired();
    }
    return true;
  }

  private async guardByDBInfoCheck(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredSubscription = this.getRequiredSubscriptions(context);
    // PRO, TRIAL, UNSUBSCRIBED - all possibilities
    if (!requiredSubscription || requiredSubscription.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const email = user?.email as string | undefined;
    if (!email) {
      this.throwSubscriptionRequired();
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        status: true,
        subscriptionExpiration: true,
      },
    });

    // const isExpired = dbUser?.subscriptionExpiration && dbUser.subscriptionExpiration.getTime() <= Date.now();
    const effectiveStatus = dbUser
      ? (dbUser.status ?? "UNSUBSCRIBED")
      : "UNSUBSCRIBED";

    const hasSubscription = requiredSubscription.includes(effectiveStatus);
    if (!hasSubscription) {
      this.throwSubscriptionRequired();
    }

    return true;
  }
}
