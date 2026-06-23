import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { IdentityController } from './identity.controller';
import { IdentityRepository } from './identity.repository';
import { IdentityService } from './identity.service';
import { MockIdentityProvider } from './providers/mock-identity.provider';

@Module({
  controllers: [IdentityController],
  imports: [AuditModule, AuthModule],
  providers: [IdentityRepository, IdentityService, MockIdentityProvider],
})
export class IdentityModule {}
