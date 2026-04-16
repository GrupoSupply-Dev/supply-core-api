import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    const adminPassword = this.config.get<string>('ADMIN_PASSWORD');
    const jwtExpires = this.config.get<string>('JWT_EXPIRES_IN') ?? '1d';

    if (!adminEmail || !adminPassword) {
      throw new UnauthorizedException(
        'Server auth is not configured (ADMIN_EMAIL / ADMIN_PASSWORD).',
      );
    }

    if (!this.safeStringEqual(dto.email.trim(), adminEmail.trim())) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    if (!this.safeStringEqual(dto.password, adminPassword)) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = {
      sub: 'admin',
      role: 'admin' as const,
      email: adminEmail.trim(),
    };

    const access_token = await this.jwtService.signAsync(payload);
    const expires_in = this.parseExpiresInSeconds(jwtExpires);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in,
    };
  }

  /** Constant-length comparison via SHA-256 digests (same length). */
  private safeStringEqual(a: string, b: string): boolean {
    const ha = createHash('sha256').update(a, 'utf8').digest();
    const hb = createHash('sha256').update(b, 'utf8').digest();
    return timingSafeEqual(ha, hb);
  }

  private parseExpiresInSeconds(exp: string): number {
    const m = /^(\d+)([smhd])$/i.exec(exp.trim());
    if (!m) {
      return 86400;
    }
    const n = Number(m[1]);
    const u = m[2].toLowerCase();
    switch (u) {
      case 's':
        return n;
      case 'm':
        return n * 60;
      case 'h':
        return n * 3600;
      case 'd':
        return n * 86400;
      default:
        return 86400;
    }
  }
}
