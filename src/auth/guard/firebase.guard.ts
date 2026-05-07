// auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import * as admin from "firebase-admin";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: admin.auth.DecodedIdToken;
    }>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("No token provided");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      request["user"] = decodedToken;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
