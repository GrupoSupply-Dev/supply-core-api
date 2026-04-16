import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { isSwaggerDocumentationPath } from '../../../common/http/public-http-routes';
import type { JwtValidatedUser } from '../strategies/jwt.strategy';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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

    const request = context.switchToHttp().getRequest<{ user?: JwtValidatedUser }>();
    const user = request.user;
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Admin privileges are required for this action.');
    }
    return true;
  }
}
