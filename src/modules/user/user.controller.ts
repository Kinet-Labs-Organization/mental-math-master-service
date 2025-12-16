import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUser } from "@/src/auth/decorator";
import { JwtGuard } from "@/src/auth/guard";
import { AccessTokenDto } from "@/src/auth/dto";

@UseGuards(JwtGuard)
@Controller("user")
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Get("me")
  async me(@GetUser() user: AccessTokenDto) {
    return user;
  }
}
