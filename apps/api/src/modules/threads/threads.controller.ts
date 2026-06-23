import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// DTO classes must remain runtime imports for Nest validation metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateThreadDto } from './dto/create-thread.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ListThreadsQueryDto } from './dto/list-threads-query.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ThreadParamsDto } from './dto/thread-params.dto';
import { ThreadsService } from './threads.service';
import type {
  ApiSuccess,
  PaginatedResult,
  ThreadDetail,
  ThreadListItem,
} from './threads.types';
import { successResponse } from './threads.types';

@Controller('threads')
export class ThreadsController {
  constructor(
    @Inject(ThreadsService) private readonly threadsService: ThreadsService,
  ) {}

  @Get()
  async listThreads(
    @Query() query: ListThreadsQueryDto,
  ): Promise<ApiSuccess<PaginatedResult<ThreadListItem>>> {
    return successResponse(await this.threadsService.listThreads(query));
  }

  @Get(':threadId')
  async getThread(
    @Param() params: ThreadParamsDto,
  ): Promise<ApiSuccess<ThreadDetail>> {
    return successResponse(
      await this.threadsService.getThread(params.threadId),
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UseGuards(JwtAuthGuard)
  async createThread(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateThreadDto,
  ): Promise<ApiSuccess<ThreadDetail>> {
    return successResponse(
      await this.threadsService.createThread(user.userId, dto),
    );
  }
}
