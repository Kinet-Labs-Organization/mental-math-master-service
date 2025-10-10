import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      secretOrKey: config.get<string>('JWT_SECRET') as string,
    });
  }

  validate({
    id,
    email,
    name,
    role,
    company_id
  }: {
    id: string;
    email: string;
    name: string;
    role: string;
    company_id: string;
  }) {
    return {
      id,
      email,
      name,
      role,
      company_id
    };
  }
}
