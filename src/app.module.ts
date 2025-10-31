import { Module } from '@nestjs/common';
import { VendorModule } from '@/src/modules/vendor/vendor.module';
import { OrderModule } from '@/src/modules/order/order.module';
import { ProductModule } from '@/src/modules/product/product.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { WinstonModule } from 'nest-winston';
import { WinstonOptions } from '@/src/app-config/winston.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerOption } from './app-config/throttler.config';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
  }),
    VendorModule,
    OrderModule,
    ProductModule,
    AuthModule,
  WinstonModule.forRoot(WinstonOptions),
    ThrottlerModule.forRoot({
      throttlers: ThrottlerOption,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
  useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
