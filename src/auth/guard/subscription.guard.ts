import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SUBSCRIPTION_GUARD_KEY } from "../decorator/subscription-guard.decorator";

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredSubscription = this.reflector.getAllAndOverride<string[]>(
      SUBSCRIPTION_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredSubscription || requiredSubscription.length === 0 || requiredSubscription.includes("FREE")) {
      return true; // No subscription guard required, allow access
    }
    const { user } = context.switchToHttp().getRequest();
    const hasSubscription = requiredSubscription.includes(user?.status);
    if (!hasSubscription) {
      throw new ForbiddenException(
        { appMessage: "A PRO subscription is required to access this feature.", appAction: "UNSUBSCRIBED_USER" },
      );
    }
    return true;
  }
}
