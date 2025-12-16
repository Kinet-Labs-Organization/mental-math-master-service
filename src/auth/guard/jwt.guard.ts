import { AuthGuard } from "@nestjs/passport";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SKIP_GUARD_KEY } from "../decorator/skip-guard.decorator";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isSkipGuard = this.reflector.getAllAndOverride<boolean>(
      SKIP_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isSkipGuard) {
      return true;
    }

    return super.canActivate(context);
  }
}
