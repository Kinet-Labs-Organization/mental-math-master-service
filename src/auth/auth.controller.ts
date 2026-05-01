import { Body, Controller, Post, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserAuthDTO, UserSignupDTO } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // Unused endpoints for now, as we're relying on Firebase Authentication for user management
  @Post("signin")
  siginin(@Body(ValidationPipe) dto: UserAuthDTO) {
    return this.authService.signin(dto);
  }

  // Unused endpoints for now, as we're relying on Firebase Authentication for user management
  @Post("signup")
  signup(@Body(ValidationPipe) dto: UserSignupDTO) {
    return this.authService.signup(dto);
  }
}
