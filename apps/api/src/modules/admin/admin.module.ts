import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';

@Module({
  controllers: [AdminController],
  imports: [AuditModule, AuthModule],
  providers: [AdminGuard, AdminRepository, AdminService],
})
export class AdminModule {}
