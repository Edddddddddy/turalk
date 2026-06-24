import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ThreadsController } from './threads.controller';
import { ThreadsRepository } from './threads.repository';
import { ThreadsService } from './threads.service';

@Module({
  controllers: [ThreadsController],
  imports: [AuditModule, AuthModule],
  providers: [ThreadsRepository, ThreadsService],
})
export class ThreadsModule {}
