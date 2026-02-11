import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { HttpExceptionFilter } from "./http-exception.filter";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor() {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let message = "Something went wrong. Try again later";

    if (exception instanceof HttpException) {
      HttpExceptionFilter.prototype.catch.call(this, exception, host);
      // status = exception.getStatus();
      // const res = exception.getResponse();
      // message = typeof res === "string" ? res : (res as any).message || message;
      // appMessage = exception.getResponse()['appMessage'];
    } else {
      Logger.error(`Unhandled Exception: "Unhandled"}`, {
        exception,
      });
      response.status(status).json({
        status: "failure",
        message,
      });
    }
  }
}
