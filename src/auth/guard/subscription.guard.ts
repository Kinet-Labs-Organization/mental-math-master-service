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

    // const nowInSeconds = Math.floor(Date.now() / 1000);
    const claimStatus = user?.status as string | undefined;
    // const claimExpiry = user?.subscriptionExpiration as number | undefined;

    let effectiveStatus = claimStatus ?? "UNSUBSCRIBED";
    // This logic is bypassed because we are now relying on RevenueCat webhooks to keep user subscription status up to date in the database, and the subscription sync endpoint that can be called from the client to sync the latest subscription status from RevenueCat, instead of relying solely on token claims that may expire and cause bad user experience if not refreshed in time. However, keeping this logic here for now for better safety and fallback in case there are any issues with webhook or sync mechanism, but it can be removed in the future if we find it unnecessary.
    // if (
    //   (effectiveStatus === "PRO" || effectiveStatus === "TRIAL") &&
    //   typeof claimExpiry === "number" &&
    //   claimExpiry <= nowInSeconds
    // ) {
    //   effectiveStatus = "UNSUBSCRIBED";
    //   const email = user?.email as string | undefined;
    //   const uid = user?.uid as string | undefined;
    //   if (email && uid) {
    //     try {
    //       await this.userService.unsubscribe(email, uid);
    //     } catch (error) {
    //       console.warn(
    //         "Failed to auto-unsubscribe user from expired token claim:",
    //         error,
    //       );
    //     }
    //   }
    // }

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
