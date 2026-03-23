import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SUBSCRIPTION_GUARD_KEY } from "../decorator/subscription-guard.decorator";
import { UserService } from "@/src/modules/user/user.service";

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredSubscription = this.reflector.getAllAndOverride<string[]>(
      SUBSCRIPTION_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );
    // PRO, TRIAL, UNSUBSCRIBED - all posibilities
    if (!requiredSubscription || requiredSubscription.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const claimStatus = user?.status as string | undefined;
    const claimExpiry = user?.subscriptionExpiration as number | undefined;

    let effectiveStatus = claimStatus ?? "UNSUBSCRIBED";
    if (
      (effectiveStatus === "PRO" || effectiveStatus === "TRIAL") &&
      typeof claimExpiry === "number" &&
      claimExpiry <= nowInSeconds
    ) {
      effectiveStatus = "UNSUBSCRIBED";
      const email = user?.email as string | undefined;
      const uid = user?.uid as string | undefined;
      if (email && uid) {
        try {
          await this.userService.unsubscribe(email, uid);
        } catch (error) {
          console.warn(
            "Failed to auto-unsubscribe user from expired token claim:",
            error,
          );
        }
      }
    }

    const hasSubscription = requiredSubscription.includes(effectiveStatus);
    if (!hasSubscription) {
      throw new ForbiddenException({
        appMessage: "A valid subscription is required to access this feature.",
        appAction: "UNSUBSCRIBED_USER",
      });
    }

    return true;
  }
}
