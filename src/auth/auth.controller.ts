import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserAuthDTO, UserSignupDTO } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("signin")
  siginin(@Body(ValidationPipe) dto: UserAuthDTO) {
    return this.authService.signin(dto);
  }

  @Post("signup")
  signup(@Body(ValidationPipe) dto: UserSignupDTO) {
    return this.authService.signup(dto);
  }
}
