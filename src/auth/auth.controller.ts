import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SignupDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('google/signup')
  googleSignup(@Body() _not_required_dto: any) {
    return this.authService.googleSignup(_not_required_dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('google/signin')
  googleSignin(@Body() _not_required_dto: any) {
    return this.authService.googleSignin(_not_required_dto);
  }
}
