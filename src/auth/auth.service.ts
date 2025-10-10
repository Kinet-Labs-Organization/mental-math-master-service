import {
  ForbiddenException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { AuthDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { VendorService } from '@/src/modules/vendor/vendor.service';
import { Role } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private readonly vendorService: VendorService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER as string)
    private readonly logger: LoggerService,
  ) { }

  async signup(signupDto: SignupDto) {
    // save the new vendor in the db
    try {
      const hash = await argon.hash(signupDto.password as string);
      const vendor = await this.vendorService.create({
        email: signupDto.email,
        password: hash,
        name: signupDto.name,
        phone: signupDto.phone,
        signUpMethod: 'EMAIL',
        companyName: signupDto.companyName,
        role: Role.VENDOR,
      });
      if (!vendor) {
        throw new ForbiddenException('vendor creation failed');
      }
      const payload = {
        id: vendor?.id,
        email: vendor?.email,
        name: vendor?.name,
        role: vendor?.role as string,
        companyId: vendor?.companyId ?? '',
      };
      return this.signToken(payload);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // find the vendor by email
    const vendor = await this.vendorService.findByEmail(dto.email);
    // if vendor does not exist throw exception
    if (!vendor) throw new ForbiddenException('Credentials incorrect');
    // compare password
    let pwMatches = false;
    if (
      vendor.signUpMethod &&
      (vendor.signUpMethod as string) === 'EMAIL' &&
      vendor.password
    ) {
      pwMatches = await argon.verify(vendor.password, dto.password);
    } else {
      throw new ForbiddenException('Credentials incorrect');
    }
    // if password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');
    const payload = {
      id: vendor?.id,
      email: vendor?.email,
      name: vendor?.name,
      role: vendor?.role,
      companyId: vendor?.companyId ?? '',
    };
    return this.signToken(payload);
  }

  async googleSignup(_not_required_dto: any) {
    const signupDto = await this.googleAuthAPI(_not_required_dto);
    // save the new vendor in the db
    try {
      const vendor = await this.vendorService.create({
        email: signupDto.email,
        password: '', // Google signup does not use password, so pass empty string or handle accordingly
        name: signupDto.name,
        signUpMethod: 'GOOGLE',
        companyName: signupDto.companyName || '',
        role: Role.VENDOR,
      });
      if (!vendor) {
        throw new ForbiddenException('vendor creation failed');
      }
      const payload = {
        id: vendor?.id,
        email: vendor?.email,
        name: vendor?.name,
        role: vendor?.role as string,
        companyId: vendor?.companyId ?? '',
      };
      return this.signToken(payload);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async googleSignin(_not_required_dto: any) {
    const signinDTO = await this.googleAuthAPI(_not_required_dto);
    if (!signinDTO) {
      throw new ForbiddenException('Google signin failed');
    }
    // find the vendor by email
    const vendor = await this.vendorService.findByEmail(signinDTO.email);
    // if vendor does not exist throw exception
    if (!vendor) throw new ForbiddenException('Something went wrong. Please contact suppot team');
    const payload = {
      id: vendor?.id,
      email: vendor?.email,
      name: vendor?.name,
      role: vendor?.role,
      companyId: vendor?.companyId ?? '',
    };
    return this.signToken(payload);
  }

  async googleAuthAPI(_not_required_dto: any) {
    return _not_required_dto; // Return true on valid google signin
  }

  async signToken({
    id,
    email,
    name,
    role,
    companyId
  }: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: string;
  }): Promise<{
    access_token: string;
    vendor: { id: string; email: string; name: string; role: string, companyId: string };
  }> {
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(
      {
        id,
        email,
        name,
        role,
        companyId
      },
      {
        expiresIn: '59m',
        secret: secret,
      },
    );

    return {
      access_token: token,
      vendor: {
        id,
        email,
        name,
        role,
        companyId
      },
    };
  }
}
