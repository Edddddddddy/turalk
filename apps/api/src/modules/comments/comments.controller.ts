import {
  Body,
  Controller,
  Delete,
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
import { CommentsService } from './comments.service';
import type {
  ApiSuccess,
  CommentItem,
  PaginatedResult,
} from './comments.types';
import { successResponse } from './comments.types';
// DTO classes must remain runtime imports for Nest validation metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CommentParamsDto } from './dto/comment-params.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateCommentDto } from './dto/create-comment.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    @Inject(CommentsService)
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  async listComments(
    @Query() query: ListCommentsQueryDto,
  ): Promise<ApiSuccess<PaginatedResult<CommentItem>>> {
    return successResponse(await this.commentsService.listComments(query));
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UseGuards(JwtAuthGuard)
  async createComment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCommentDto,
  ): Promise<ApiSuccess<CommentItem>> {
    return successResponse(
      await this.commentsService.createComment(user.userId, dto),
    );
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: CommentParamsDto,
  ): Promise<ApiSuccess<{ deleted: true }>> {
    await this.commentsService.deleteComment(params.commentId, user.userId);
    return successResponse({ deleted: true });
  }
}
