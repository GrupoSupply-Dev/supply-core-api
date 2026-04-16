import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

type PrismaMeta = {
  target?: string | string[];
  field_name?: string;
  cause?: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload =
        typeof body === 'string'
          ? { statusCode: status, message: body, path }
          : { ...(body as object), path };
      response.status(status).json(payload);
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const { status, body } = this.mapPrismaKnownRequest(exception, path);
      this.logger.warn(
        `${request.method} ${path} -> ${status} [Prisma ${exception.code}]`,
      );
      response.status(status).json(body);
      return;
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.warn(`${request.method} ${path} -> 400 [Prisma validation]`);
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message:
          'The request could not be translated into a valid database operation.',
        path,
      });
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred.',
      path,
    });
  }

  private mapPrismaKnownRequest(
    err: Prisma.PrismaClientKnownRequestError,
    path: string,
  ): { status: number; body: Record<string, unknown> } {
    const meta = (err.meta ?? {}) as PrismaMeta;
    const targets = this.normalizeTargets(meta.target);

    switch (err.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          body: {
            statusCode: HttpStatus.CONFLICT,
            error: 'Conflict',
            message: this.uniqueConstraintMessage(targets),
            code: err.code,
            fields: targets,
            path,
          },
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          body: {
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message:
              'Foreign key constraint failed. The referenced category or related record does not exist, or this row cannot be deleted because others depend on it.',
            code: err.code,
            field: meta.field_name,
            path,
          },
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            statusCode: HttpStatus.NOT_FOUND,
            error: 'Not Found',
            message:
              'The requested record was not found, or the operation expected rows that are missing.',
            code: err.code,
            path,
          },
        };
      case 'P2014':
        return {
          status: HttpStatus.BAD_REQUEST,
          body: {
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message:
              'The change would break a required relation between records.',
            code: err.code,
            path,
          },
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          body: {
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: `Database request failed (${err.code}).`,
            code: err.code,
            path,
          },
        };
    }
  }

  private normalizeTargets(target: PrismaMeta['target']): string[] {
    if (!target) {
      return [];
    }
    return Array.isArray(target) ? target : [target];
  }

  private uniqueConstraintMessage(targets: string[]): string {
    if (targets.length > 0) {
      return `A record with the same value already exists for: ${targets.join(', ')}. Use a different value or update the existing record.`;
    }
    return 'A record with the same unique value already exists.';
  }
}
