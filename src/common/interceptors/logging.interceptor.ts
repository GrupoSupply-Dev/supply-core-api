import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    const req = context.switchToHttp().getRequest<Request & { requestId?: string }>();
    const res = context.switchToHttp().getResponse<Response>();
    const started = Date.now();
    const { method, originalUrl } = req;

    const incoming = req.headers['x-request-id'];
    const requestId =
      typeof incoming === 'string' && incoming.length > 0 && incoming.length <= 128
        ? incoming
        : randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    return next.handle().pipe(
      tap({
        finalize: () => {
          const ms = Date.now() - started;
          const status = res.statusCode;
          const line = `${requestId} ${method} ${originalUrl} ${status} ${ms}ms`;
          if (status >= 500) {
            this.logger.error(line);
          } else if (status >= 400) {
            this.logger.warn(line);
          } else {
            this.logger.log(line);
          }
        },
      }),
    );
  }
}
