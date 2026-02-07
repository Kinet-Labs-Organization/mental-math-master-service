import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
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

    if (!requiredSubscription) {
      return true; // No subscription guard required, allow access
    }

    const { user } = context.switchToHttp().getRequest();

    return requiredSubscription.includes(user?.status);
  }
}
