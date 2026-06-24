import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ReportsController } from './reports.controller';
import { ReportsRepository } from './reports.repository';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  imports: [AuditModule, AuthModule],
  providers: [ReportsRepository, ReportsService],
})
export class ReportsModule {}
