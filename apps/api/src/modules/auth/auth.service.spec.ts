import { UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuditService } from '../audit/audit.service';
import { AuthService } from './auth.service';
import type { AuthRepository } from './auth.repository';
import type { TokenPair } from './auth.types';
import type { PasswordService } from './services/password.service';
import type { TokenService } from './services/token.service';

type CreateSession = Parameters<AuthRepository['createUserWithSession']>[3];

const publicUser = {
  displayName: '测试玩家',
  id: 'user-1',
  profile: { avatarUrl: null },
  publicId: 'public-1',
  status: UserStatus.ACTIVE,
};

const tokenPair: TokenPair = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('AuthService', () => {
  const audit = {
    record: vi.fn(async () => undefined),
  };
  const authRepository = {
    clearRefreshToken: vi.fn(),
    createUserWithSession: vi.fn(),
    findActiveUser: vi.fn(),
    findAuthByEmail: vi.fn(),
    findAuthByUserId: vi.fn(),
    rotateRefreshToken: vi.fn(),
    updateLoginSession: vi.fn(),
  };
  const passwordService = {
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
  };
  const tokenService = {
    hashRefreshToken: vi.fn(),
    issueTokenPair: vi.fn(),
    refreshTokenMatches: vi.fn(),
    verifyRefreshToken: vi.fn(),
  };

  const service = new AuthService(
    audit as unknown as AuditService,
    authRepository as unknown as AuthRepository,
    passwordService as unknown as PasswordService,
    tokenService as unknown as TokenService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('register hashes the password and never returns credential fields', async () => {
    passwordService.hashPassword.mockResolvedValue('argon2-password-hash');
    tokenService.issueTokenPair.mockResolvedValue(tokenPair);
    tokenService.hashRefreshToken.mockReturnValue('refresh-token-hash');
    authRepository.createUserWithSession.mockImplementation(
      async (
        _email: string,
        passwordHash: string,
        _displayName: string,
        createSession: CreateSession,
      ) => {
        const session = await createSession('user-1', 'public-1');

        expect(passwordHash).toBe('argon2-password-hash');
        expect(session.refreshTokenHash).toBe('refresh-token-hash');

        return { tokens: session.tokens, user: publicUser };
      },
    );

    const result = await service.register({
      email: 'player@example.com',
      nickname: '测试玩家',
      password: 'example123',
    });

    expect(passwordService.hashPassword).toHaveBeenCalledWith('example123');
    expect(result).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        displayName: '测试玩家',
        id: 'public-1',
        status: UserStatus.ACTIVE,
      },
    });
    expect(JSON.stringify(result)).not.toContain('passwordHash');
    expect(JSON.stringify(result)).not.toContain('refreshTokenHash');
  });

  it('login failure uses a generic error that does not reveal account existence', async () => {
    authRepository.findAuthByEmail.mockResolvedValue(null);
    passwordService.verifyPassword.mockResolvedValue(false);

    const error = await service
      .login({ email: 'missing@example.com', password: 'example123' })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect((error as UnauthorizedException).getResponse()).toMatchObject({
      code: 'AUTH_INVALID_CREDENTIALS',
    });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'AUTH_LOGIN_FAILED' }),
    );
  });

  it('refresh compares the stored token hash before rotating it', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({
      jti: 'refresh-jti',
      publicId: 'public-1',
      sub: 'user-1',
      tokenType: 'refresh',
    });
    authRepository.findAuthByUserId.mockResolvedValue({
      refreshTokenHash: 'stored-refresh-hash',
      user: publicUser,
      userId: 'user-1',
    });
    tokenService.refreshTokenMatches.mockReturnValue(true);
    tokenService.issueTokenPair.mockResolvedValue(tokenPair);
    tokenService.hashRefreshToken.mockReturnValue('next-refresh-hash');
    authRepository.rotateRefreshToken.mockResolvedValue(true);

    const result = await service.refresh({ refreshToken: 'raw-refresh-token' });

    expect(result).toBe(tokenPair);
    expect(tokenService.refreshTokenMatches).toHaveBeenCalledWith(
      'raw-refresh-token',
      'stored-refresh-hash',
    );
    expect(authRepository.rotateRefreshToken).toHaveBeenCalledWith(
      'user-1',
      'stored-refresh-hash',
      'next-refresh-hash',
    );
  });

  it('logout clears the stored refresh token hash', async () => {
    authRepository.clearRefreshToken.mockResolvedValue(undefined);

    await service.logout('user-1');

    expect(authRepository.clearRefreshToken).toHaveBeenCalledWith('user-1');
  });
});
