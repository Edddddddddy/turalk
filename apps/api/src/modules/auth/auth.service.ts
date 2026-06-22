import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import { AuthRepository } from './auth.repository';
import type { AuthResult, PublicAuthUser, TokenPair } from './auth.types';
import type { LoginDto } from './dto/login.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { RegisterDto } from './dto/register.dto';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(AuthRepository) private readonly authRepository: AuthRepository,
    @Inject(PasswordService) private readonly passwordService: PasswordService,
    @Inject(TokenService) private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    try {
      const result = await this.authRepository.createUserWithSession(
        dto.email,
        passwordHash,
        dto.nickname,
        async (userId, publicId) => {
          const tokens = await this.tokenService.issueTokenPair(
            userId,
            publicId,
          );
          return {
            refreshTokenHash: this.tokenService.hashRefreshToken(
              tokens.refreshToken,
            ),
            tokens,
          };
        },
      );

      return { ...result.tokens, user: this.toPublicUser(result.user) };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          code: 'AUTH_EMAIL_ALREADY_REGISTERED',
          message: 'Email is already registered',
        });
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const auth = await this.authRepository.findAuthByEmail(dto.email);
    const passwordValid = await this.passwordService.verifyPassword(
      auth?.passwordHash,
      dto.password,
    );

    if (!auth || !passwordValid || auth.user.status !== UserStatus.ACTIVE) {
      await this.audit.record({
        action: 'AUTH_LOGIN_FAILED',
        actorId: auth?.userId,
        resourceId: auth?.userId,
        resourceType: 'User',
      });
      throw this.invalidCredentials();
    }

    const tokens = await this.tokenService.issueTokenPair(
      auth.userId,
      auth.user.publicId,
    );
    await this.authRepository.updateLoginSession(
      auth.userId,
      this.tokenService.hashRefreshToken(tokens.refreshToken),
    );

    return { ...tokens, user: this.toPublicUser(auth.user) };
  }

  async refresh(dto: RefreshTokenDto): Promise<TokenPair> {
    const payload = await this.tokenService.verifyRefreshToken(
      dto.refreshToken,
    );
    const auth = await this.authRepository.findAuthByUserId(payload.sub);

    if (
      !auth?.refreshTokenHash ||
      auth.user.status !== UserStatus.ACTIVE ||
      !this.tokenService.refreshTokenMatches(
        dto.refreshToken,
        auth.refreshTokenHash,
      )
    ) {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_TOKEN',
        message: 'Authentication token is invalid or expired',
      });
    }

    const tokens = await this.tokenService.issueTokenPair(
      auth.userId,
      auth.user.publicId,
    );
    const rotated = await this.authRepository.rotateRefreshToken(
      auth.userId,
      auth.refreshTokenHash,
      this.tokenService.hashRefreshToken(tokens.refreshToken),
    );

    if (!rotated) {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_TOKEN',
        message: 'Authentication token is invalid or expired',
      });
    }

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.authRepository.clearRefreshToken(userId);
  }

  async getMe(userId: string): Promise<PublicAuthUser> {
    const user = await this.authRepository.findActiveUser(userId);

    if (!user) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication is required',
      });
    }

    return this.toPublicUser(user);
  }

  private invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException({
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Email or password is incorrect',
    });
  }

  private toPublicUser(user: {
    displayName: string;
    profile: { avatarUrl: string | null } | null;
    publicId: string;
    status: UserStatus;
  }): PublicAuthUser {
    return {
      avatarUrl: user.profile?.avatarUrl ?? null,
      displayName: user.displayName,
      id: user.publicId,
      status: user.status,
    };
  }
}
