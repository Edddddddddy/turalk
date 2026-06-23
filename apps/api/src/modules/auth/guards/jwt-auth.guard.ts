import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

import { AuthRepository } from '../auth.repository';
import type { AuthenticatedUser } from '../auth.types';
import { TokenService } from '../services/token.service';

interface AuthenticatedRequest {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AuthRepository) private readonly authRepository: AuthRepository,
    @Inject(TokenService) private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);
    const payload = await this.tokenService.verifyAccessToken(token);
    const user = await this.authRepository.findActiveUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication is required',
      });
    }

    request.user = {
      displayName: user.displayName,
      publicId: user.publicId,
      status: user.status,
      userId: user.id,
    };

    return true;
  }

  private extractBearerToken(authorization?: string): string {
    const [scheme, token] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication is required',
      });
    }

    return token;
  }
}
