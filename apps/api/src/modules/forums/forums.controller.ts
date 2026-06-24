import { Controller, Get, Inject } from '@nestjs/common';

import { ForumsService } from './forums.service';
import type { ApiSuccess, ForumSummary } from './forums.types';
import { successResponse } from './forums.types';

@Controller('forums')
export class ForumsController {
  constructor(
    @Inject(ForumsService) private readonly forumsService: ForumsService,
  ) {}

  @Get()
  async listForums(): Promise<ApiSuccess<ForumSummary[]>> {
    return successResponse(await this.forumsService.listForums());
  }
}
