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
    // PRO, TRIAL, UNSUBSCRIBED - all posibilities
    if (!requiredSubscription || requiredSubscription.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const hasSubscription = requiredSubscription.includes(user?.status);
    console.log('user?.status');
    console.log(user?.status);
    // if (!hasSubscription) {
    //   throw new ForbiddenException(
    //     { appMessage: "A PRO subscription is required to access this feature.", appAction: "UNSUBSCRIBED_USER" },
    //   );
    // }
    return true;
  }
}
