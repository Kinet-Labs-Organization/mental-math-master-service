import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from './auth/guard';
import { SkipGuard } from './auth/decorator';

@UseGuards(JwtGuard)
@Controller()
export class AppController {
  @SkipGuard()
  @Get('health')
  health(): string {
    return 'Application Backend Service is up and running!';
  }
}
