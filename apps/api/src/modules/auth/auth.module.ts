import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuditModule } from '../audit/audit.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

@Module({
  controllers: [AuthController],
  exports: [JwtAuthGuard, TokenService],
  imports: [AuditModule, JwtModule.register({})],
  providers: [
    AuthRepository,
    AuthService,
    JwtAuthGuard,
    PasswordService,
    TokenService,
  ],
})
export class AuthModule {}
