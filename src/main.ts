import "@/src/telemetry/otel.tracing";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { CORSOption } from "./app-config/cors.config";
import { HelmetOptions } from "./app-config/helmet.config";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AllExceptionsFilter } from "./filters/unhandled-exception.filter";
import { Logger } from "@nestjs/common";
import { TransformResponseInterceptor } from "./interceptors/transform-response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER as string));
  app.enableCors(CORSOption);
  app.use(helmet(HelmetOptions));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  await app.listen(process.env.PORT || 3001, () => {
    Logger.log(
      `Application is running on: http://localhost:${process.env.PORT || 3001}`,
    );
  });
}
void bootstrap();
