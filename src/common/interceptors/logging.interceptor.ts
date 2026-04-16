import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    const req = context.switchToHttp().getRequest<Request>();
    const started = Date.now();
    const { method, originalUrl } = req;

    return next.handle().pipe(
      tap({
        finalize: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const ms = Date.now() - started;
          this.logger.log(`${method} ${originalUrl} ${res.statusCode} ${ms}ms`);
        },
      }),
    );
  }
}
