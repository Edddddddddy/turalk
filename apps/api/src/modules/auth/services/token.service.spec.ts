import type { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, it, vi } from 'vitest';

import { TokenService } from './token.service';

function createTokenService(): TokenService {
  const values: Record<string, string> = {
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_ACCESS_SECRET: 'access-secret-value-at-least-32-chars',
    JWT_REFRESH_EXPIRES_IN: '7d',
    JWT_REFRESH_SECRET: 'refresh-secret-value-at-least-32-chars',
  };
  const config = {
    getOrThrow: vi.fn((key: string) => values[key]),
  } as Pick<ConfigService, 'getOrThrow'>;

  return new TokenService(config as ConfigService, new JwtService());
}

describe('TokenService', () => {
  it('issues access and refresh tokens with required safe payload fields', async () => {
    const service = createTokenService();

    const tokens = await service.issueTokenPair('user-1', 'public-1');
    const accessPayload = await service.verifyAccessToken(tokens.accessToken);
    const refreshPayload = await service.verifyRefreshToken(
      tokens.refreshToken,
    );

    expect(tokens.accessToken).toEqual(expect.any(String));
    expect(tokens.refreshToken).toEqual(expect.any(String));
    expect(accessPayload).toMatchObject({
      publicId: 'public-1',
      sub: 'user-1',
      tokenType: 'access',
    });
    expect(refreshPayload).toMatchObject({
      publicId: 'public-1',
      sub: 'user-1',
      tokenType: 'refresh',
    });
    expect(accessPayload.jti).toEqual(expect.any(String));
    expect(refreshPayload.jti).toEqual(expect.any(String));
    expect(accessPayload).not.toHaveProperty('passwordHash');
    expect(accessPayload).not.toHaveProperty('refreshTokenHash');
    expect(accessPayload).not.toHaveProperty('email');
  });

  it('hashes refresh tokens and compares hashes without storing raw tokens', async () => {
    const service = createTokenService();
    const { refreshToken } = await service.issueTokenPair('user-1', 'public-1');

    const refreshTokenHash = service.hashRefreshToken(refreshToken);

    expect(refreshTokenHash).not.toBe(refreshToken);
    expect(refreshTokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(service.refreshTokenMatches(refreshToken, refreshTokenHash)).toBe(
      true,
    );
    expect(service.refreshTokenMatches('other-token', refreshTokenHash)).toBe(
      false,
    );
  });
});
