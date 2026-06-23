import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuditModule } from '../audit/audit.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

function readRateLimit(config: ConfigService, key: string): number {
  return Number(config.getOrThrow<number>(key));
}

@Module({
  controllers: [AuthController],
  exports: [JwtAuthGuard, TokenService],
  imports: [
    AuditModule,
    ConfigModule,
    JwtModule.register({}),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            limit: readRateLimit(config, 'AUTH_REGISTER_LIMIT'),
            name: 'authRegister',
            ttl: readRateLimit(config, 'AUTH_REGISTER_TTL_SECONDS') * 1000,
          },
          {
            limit: readRateLimit(config, 'AUTH_LOGIN_LIMIT'),
            name: 'authLogin',
            ttl: readRateLimit(config, 'AUTH_LOGIN_TTL_SECONDS') * 1000,
          },
          {
            limit: readRateLimit(config, 'AUTH_REFRESH_LIMIT'),
            name: 'authRefresh',
            ttl: readRateLimit(config, 'AUTH_REFRESH_TTL_SECONDS') * 1000,
          },
        ],
      }),
    }),
  ],
  providers: [
    AuthRepository,
    AuthService,
    JwtAuthGuard,
    PasswordService,
    TokenService,
  ],
})
export class AuthModule {}
