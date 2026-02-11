import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor() {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    const status = exception.getStatus();
    const message = exception.message ?? "Something went wrong. Try again later";
    const appMessage = exception.getResponse()['appMessage'];
    const appAction = exception.getResponse()['appAction'];

    Logger.error(`HTTP Exception: ${exception.message}`, {
      exception,
      status,
    });
    response.status(status).json({
      status: "failure",
      message,
      appMessage,
      appAction
    });
  }
}
