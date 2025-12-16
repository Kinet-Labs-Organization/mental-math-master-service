import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AccessTokenDto } from "../dto";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
      secretOrKey: config.get<string>("JWT_SECRET") as string,
    });
  }

  validate(accessTokenPayload: AccessTokenDto) {
    return {
      email: accessTokenPayload.email,
      subscribedOn: accessTokenPayload.subscribedOn || null,
      subscriptionExpiration: accessTokenPayload.subscriptionExpiration || null,
      term: accessTokenPayload.term || null,
      status: accessTokenPayload.status,
    };
  }
}
