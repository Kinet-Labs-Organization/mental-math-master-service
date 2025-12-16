import {
  ForbiddenException,
  Inject,
  Injectable,
  LoggerService,
} from "@nestjs/common";
import { AccessTokenDto, UserAuthDTO, UserSignupDTO } from "./dto";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { UserService } from "../modules/user/user.service";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER as string)
    private readonly logger: LoggerService,
  ) {}

  async signin(dto: UserAuthDTO) {
    const user = await this.userService.findUserByEmail(dto.email);
    if (!user) throw new ForbiddenException("Credentials incorrect");
    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches) throw new ForbiddenException("Credentials incorrect");
    const payload: AccessTokenDto = {
      email: user.email,
      subscribedOn: user.subscribedOn || null,
      subscriptionExpiration: user.subscriptionExpiration || null,
      term: user.term || null,
      status: user.status,
    };
    return this.signToken(payload);
  }

  async signup(signupDto: UserSignupDTO) {
    try {
      const hash = await argon.hash(signupDto.password);
      const createUserInput: Prisma.UserCreateInput = {
        email: signupDto.email,
        password: hash,
        name: signupDto.name,
        status: "UNSUBSCRIBED",
      };
      const user = await this.userService.createUser(createUserInput);
      if (!user) {
        throw new ForbiddenException("User creation failed");
      }
      const payload: AccessTokenDto = {
        email: user.email,
        subscribedOn: user.subscribedOn || null,
        subscriptionExpiration: user.subscriptionExpiration || null,
        term: user.term || null,
        status: user.status,
      };
      return this.signToken(payload);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Credentials taken");
        }
      }
      throw error;
    }
  }

  async signToken(accessTokenPayload: AccessTokenDto): Promise<{
    access_token: string;
  }> {
    const secret = this.config.get("JWT_SECRET");
    const token = await this.jwt.signAsync(
      {
        email: accessTokenPayload.email,
        subscribedOn: accessTokenPayload.subscribedOn || null,
        subscriptionExpiration:
          accessTokenPayload.subscriptionExpiration || null,
        term: accessTokenPayload.term || null,
        status: accessTokenPayload.status,
      },
      {
        expiresIn: "59m",
        secret: secret,
      },
    );
    return {
      access_token: token,
    };
  }
}
