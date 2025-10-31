import {
  ForbiddenException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { AccessTokenUserDto, StaffAuthDto, StaffSignupDto, VendorOwnerAuthDto, VendorWithOwnerSignupDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { VendorService } from '@/src/modules/vendor/vendor.service';
import { Prisma, Role, Vendor } from '@prisma/client';
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

  async vendorWithOwnerSignup(signupDto: VendorWithOwnerSignupDto) {
    try {
      const hash = await argon.hash(signupDto.userPassword as string);

      const vendorCreateInput: Prisma.VendorCreateInput = {
        name: signupDto.vendorName,
        vendorId: signupDto.vendorId,
      };

      const vendorUserCreateInput: Omit<Prisma.VendorUserCreateInput, 'vendor'> = {
        email: signupDto.userEmail,
        password: hash,
        name: signupDto.userFullName,
        phone: signupDto.userPhone || '',
        signUpMethod: 'EMAIL',
        role: Role.OWNER,
      };

      const result = await this.vendorService.createVendorAndVendorOwner(
        vendorCreateInput,
        vendorUserCreateInput,
      );
      if (!result) {
        throw new ForbiddenException('Vendor creation failed');
      }
      const payload = {
        vendorUUID: result.createdVendor.id,
        vendorId: result.createdVendor.vendorId,
        userUUID: result.createdVendorUser.id,
        userEmail: result.createdVendorUser.email,
        userRole: result.createdVendorUser.role
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

  async vendorOwnerSignin(dto: VendorOwnerAuthDto) {
    // find the vendor by email
    const vendorOwner = await this.vendorService.findOwnerByEmail(dto.email);
    // if vendor does not exist throw exception
    if (!vendorOwner) throw new ForbiddenException('Credentials incorrect');
    // compare password
    let pwMatches = false;
    if (
      vendorOwner.signUpMethod &&
      (vendorOwner.signUpMethod as string) === 'EMAIL' &&
      vendorOwner.password
    ) {
      pwMatches = await argon.verify(vendorOwner.password, dto.password);
    } else {
      throw new ForbiddenException('Credentials incorrect');
    }
    // if password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');
    const payload = {
      vendorUUID: vendorOwner.vendorId,
      vendorId: vendorOwner.vendor.vendorId,
      userUUID: vendorOwner.id,
      userEmail: vendorOwner.email,
      userRole: vendorOwner.role
    };
    return this.signToken(payload);
  }

  async staffSignup(signupDto: StaffSignupDto, user: AccessTokenUserDto) {
    try {
      const hash = await argon.hash(signupDto.userPassword as string);

      // const vendorCreateInput: Prisma.VendorCreateInput = {
      //   name: signupDto.vendorName,
      //   vendorId: signupDto.vendorId,
      // };

      const vendorUserCreateInput: Omit<Prisma.VendorUserCreateInput, 'vendor'> = {
        email: signupDto.userEmail,
        password: hash,
        name: signupDto.userFullName,
        phone: signupDto.userPhone || '',
        signUpMethod: 'EMAIL',
        role: Role.STAFF,
      };

      const result = await this.vendorService.createStaff(
        user,
        vendorUserCreateInput,
      );
      if (!result) {
        throw new ForbiddenException('Staff creation failed');
      }
      return;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async staffSignin(dto: StaffAuthDto) {
    // find the staff by email
    const staff = await this.vendorService.findStaffByOnlyEmail(dto.email, dto.vendorId);
    // if staff does not exist throw exception
    if (!staff) throw new ForbiddenException('Credentials incorrect');
    // compare password
    let pwMatches = false;
    if (
      staff.signUpMethod &&
      (staff.signUpMethod as string) === 'EMAIL' &&
      staff.password
    ) {
      pwMatches = await argon.verify(staff.password, dto.password);
    } else {
      throw new ForbiddenException('Credentials incorrect');
    }
    // if password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');
    const payload = {
      vendorUUID: staff.vendorId,
      vendorId: staff.vendorId,
      userUUID: staff.id,
      userEmail: staff.email,
      userRole: staff.role
    };
    return this.signToken(payload);
  }

  async signToken({
    vendorUUID,
    vendorId,
    userUUID,
    userEmail,
    userRole,
  }: {
    vendorUUID: string;
    vendorId: string;
    userUUID: string;
    userEmail: string;
    userRole: string;
  }): Promise<{
    access_token: string;
  }> {
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(
      {
        vendorUUID,
        vendorId,
        userUUID,
        userEmail,
        userRole,
      },
      {
        expiresIn: '59m',
        secret: secret,
      },
    );

    return {
      access_token: token,
    };
  }
}
