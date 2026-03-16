import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { HttpExceptionFilter } from "./http-exception.filter";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

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
    } else if (exception instanceof PrismaClientKnownRequestError) {
      Logger.error("Unhandled Prisma exception", {
        code: exception.code,
        meta: exception.meta,
        message: exception.message,
      });
      response.status(status).json({
        status: "failure",
        message,
        prismaCode: exception.code,
      });
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
