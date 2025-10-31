import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenUserDto, StaffAuthDto, StaffSignupDto, VendorOwnerAuthDto, VendorWithOwnerSignupDto } from './dto';
import { GetUser } from './decorator';
import { JwtGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('vendor/signup')
  vendorWithOwnerSignup(@Body(ValidationPipe) dto: VendorWithOwnerSignupDto) {
    return this.authService.vendorWithOwnerSignup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('vendor/signin')
  vendorOwnerSignin(@Body(ValidationPipe) dto: VendorOwnerAuthDto) {
    return this.authService.vendorOwnerSignin(dto);
  }

  @UseGuards(JwtGuard)
  @Post('staff/signup')
  staffSignup(@Body(ValidationPipe) dto: StaffSignupDto, @GetUser() user: AccessTokenUserDto) {
    return this.authService.staffSignup(dto, user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('staff/signin')
  staffSignin(@Body(ValidationPipe) dto: StaffAuthDto) {
    return this.authService.staffSignin(dto);
  }
}
