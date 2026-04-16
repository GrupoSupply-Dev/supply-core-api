import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtValidatedUser = {
  userId: string;
  role: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const secret = config.getOrThrow<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: {
    sub?: string;
    role?: string;
    email?: string;
  }): JwtValidatedUser {
    if (!payload?.sub || !payload.role || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      userId: payload.sub,
      role: payload.role,
      email: payload.email,
    };
  }
}
