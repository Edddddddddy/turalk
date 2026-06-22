import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';

import type { JwtTokenPayload, TokenPair } from '../auth.types';

const tokenIssuer = 'turalk-api';
const tokenAudience = 'turalk-web';

@Injectable()
export class TokenService {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  async issueTokenPair(userId: string, publicId: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(userId, publicId, 'access'),
      this.signToken(userId, publicId, 'refresh'),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<JwtTokenPayload> {
    return this.verifyToken(token, 'access');
  }

  async verifyRefreshToken(token: string): Promise<JwtTokenPayload> {
    return this.verifyToken(token, 'refresh');
  }

  hashRefreshToken(token: string): string {
    return createHmac('sha256', this.getRefreshSecret())
      .update(token, 'utf8')
      .digest('hex');
  }

  refreshTokenMatches(token: string, expectedHash: string): boolean {
    const actual = Buffer.from(this.hashRefreshToken(token), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');

    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }

  private async signToken(
    userId: string,
    publicId: string,
    tokenType: JwtTokenPayload['tokenType'],
  ): Promise<string> {
    const isAccessToken = tokenType === 'access';
    const secret = isAccessToken
      ? this.config.getOrThrow<string>('JWT_ACCESS_SECRET')
      : this.getRefreshSecret();
    const expiresIn = this.config.getOrThrow<string>(
      isAccessToken ? 'JWT_ACCESS_EXPIRES_IN' : 'JWT_REFRESH_EXPIRES_IN',
    ) as JwtSignOptions['expiresIn'];

    return this.jwt.signAsync(
      { publicId, sub: userId, tokenType },
      {
        algorithm: 'HS256',
        audience: tokenAudience,
        expiresIn,
        issuer: tokenIssuer,
        jwtid: randomUUID(),
        secret,
      },
    );
  }

  private async verifyToken(
    token: string,
    expectedType: JwtTokenPayload['tokenType'],
  ): Promise<JwtTokenPayload> {
    try {
      const payload = await this.jwt.verifyAsync<JwtTokenPayload>(token, {
        algorithms: ['HS256'],
        audience: tokenAudience,
        issuer: tokenIssuer,
        secret:
          expectedType === 'access'
            ? this.config.getOrThrow<string>('JWT_ACCESS_SECRET')
            : this.getRefreshSecret(),
      });

      if (
        payload.tokenType !== expectedType ||
        !payload.sub ||
        !payload.publicId ||
        !payload.jti
      ) {
        throw new Error('Invalid token payload');
      }

      return payload;
    } catch {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_TOKEN',
        message: 'Authentication token is invalid or expired',
      });
    }
  }

  private getRefreshSecret(): string {
    return this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
  }
}
