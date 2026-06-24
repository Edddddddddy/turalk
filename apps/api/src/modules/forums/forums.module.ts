import { Module } from '@nestjs/common';

import { ForumsController } from './forums.controller';
import { ForumsRepository } from './forums.repository';
import { ForumsService } from './forums.service';

@Module({
  controllers: [ForumsController],
  providers: [ForumsRepository, ForumsService],
})
export class ForumsModule {}
