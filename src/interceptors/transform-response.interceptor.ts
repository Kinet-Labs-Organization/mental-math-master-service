import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    Logger.log('TransformResponseInterceptor: Intercepting response...');

    const request = context.switchToHttp().getRequest();
    Logger.log(
      `TransformResponseInterceptor: Original request body: ${JSON.stringify(request.body)}`,
    );

    Logger.log(
      `TransformResponseInterceptor: Transformed request body: ${JSON.stringify(request.body)}`,
    );

    // this.transformUpstream(context.switchToHttp().getRequest().url, data);
    return next.handle().pipe(
      map((data) => ({
        status: 'success',
        data,
      })),
      tap(() =>
        Logger.log('TransformResponseInterceptor: Response transformed.'),
      ),
    );
  }
}
