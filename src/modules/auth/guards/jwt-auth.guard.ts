import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { isObservable, lastValueFrom } from 'rxjs';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { isSwaggerDocumentationPath } from '../../../common/http/public-http-routes';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    if (isSwaggerDocumentationPath(req.path)) {
      return true;
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const result = super.canActivate(context);
    if (isObservable(result)) {
      return lastValueFrom(result);
    }
    if (result instanceof Promise) {
      return result;
    }
    return result;
  }

  override handleRequest<TUser = unknown>(
    err: Error | undefined,
    user: TUser,
    info: Error | undefined,
  ): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException(info?.message ?? 'Unauthorized');
    }
    return user;
  }
}
