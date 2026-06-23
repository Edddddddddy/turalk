import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import type {
  ApiSuccess,
  AuthenticatedUser,
  AuthResult,
  PublicAuthUser,
  TokenPair,
} from './auth.types';
import { successResponse } from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';
// DTO classes must remain runtime imports for Nest validation metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { LoginDto } from './dto/login.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { RefreshTokenDto } from './dto/refresh-token.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@UseGuards(ThrottlerGuard)
@SkipThrottle({ authLogin: true, authRefresh: true, authRegister: true })
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  @SkipThrottle({ authRegister: false })
  @Throttle({ authRegister: {} })
  async register(@Body() dto: RegisterDto): Promise<ApiSuccess<AuthResult>> {
    return successResponse(await this.authService.register(dto));
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @SkipThrottle({ authLogin: false })
  @Throttle({ authLogin: {} })
  async login(@Body() dto: LoginDto): Promise<ApiSuccess<AuthResult>> {
    return successResponse(await this.authService.login(dto));
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @SkipThrottle({ authRefresh: false })
  @Throttle({ authRefresh: {} })
  async refresh(@Body() dto: RefreshTokenDto): Promise<ApiSuccess<TokenPair>> {
    return successResponse(await this.authService.refresh(dto));
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiSuccess<{ loggedOut: true }>> {
    await this.authService.logout(user.userId);
    return successResponse({ loggedOut: true });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiSuccess<PublicAuthUser>> {
    return successResponse(await this.authService.getMe(user.userId));
  }
}
