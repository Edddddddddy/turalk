import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import { CommentsRepository } from './comments.repository';
import type { CommentItem, PaginatedResult } from './comments.types';
import type { CreateCommentDto } from './dto/create-comment.dto';
import type { ListCommentsQueryDto } from './dto/list-comments-query.dto';

type CommentRecord = Awaited<ReturnType<CommentsRepository['createComment']>>;

@Injectable()
export class CommentsService {
  constructor(
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(CommentsRepository)
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async createComment(
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommentItem> {
    const verified =
      await this.commentsRepository.userHasVerifiedIdentity(userId);

    if (!verified) {
      throw new ForbiddenException({
        code: 'COMMENT_REQUIRES_VERIFIED_IDENTITY',
        message: 'Verified identity is required before publishing comments',
      });
    }

    await this.assertThreadVisible(dto.threadId);

    if (dto.parentId) {
      const parent = await this.commentsRepository.findPublishedComment(
        dto.parentId,
      );

      if (!parent || parent.threadId !== dto.threadId) {
        throw new NotFoundException({
          code: 'COMMENT_PARENT_NOT_FOUND',
          message: 'Parent comment does not exist or is not visible',
        });
      }
    }

    const comment = await this.commentsRepository.createComment(userId, dto);

    await this.audit.record({
      action: 'COMMENT_CREATED',
      actorId: userId,
      metadata: { parentId: dto.parentId ?? null, threadId: dto.threadId },
      resourceId: comment.id,
      resourceType: 'Comment',
    });

    return this.toCommentItem(comment);
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const deleted = await this.commentsRepository.softDeleteOwnedComment(
      commentId,
      userId,
    );

    if (!deleted) {
      throw new NotFoundException({
        code: 'COMMENT_NOT_FOUND',
        message: 'Comment does not exist or cannot be deleted',
      });
    }

    await this.audit.record({
      action: 'COMMENT_DELETED',
      actorId: userId,
      resourceId: commentId,
      resourceType: 'Comment',
    });
  }

  async listComments(
    query: ListCommentsQueryDto,
  ): Promise<PaginatedResult<CommentItem>> {
    await this.assertThreadVisible(query.threadId);

    const limit = query.limit;
    const records = await this.commentsRepository.findPublishedComments({
      cursor: query.cursor,
      limit,
      threadId: query.threadId,
    });
    const hasNext = records.length > limit;
    const page = hasNext ? records.slice(0, limit) : records;

    return {
      items: page.map((comment) => this.toCommentItem(comment)),
      nextCursor: hasNext ? (page.at(-1)?.id ?? null) : null,
    };
  }

  private async assertThreadVisible(threadId: string): Promise<void> {
    const thread = await this.commentsRepository.findVisibleThread(threadId);

    if (!thread) {
      throw new NotFoundException({
        code: 'THREAD_NOT_FOUND',
        message: 'Thread does not exist or is not visible',
      });
    }
  }

  private toCommentItem(comment: CommentRecord): CommentItem {
    return {
      author: {
        avatarUrl: comment.author.profile?.avatarUrl ?? null,
        displayName: comment.author.displayName,
        id: comment.author.publicId,
      },
      content: comment.content,
      createdAt: comment.createdAt,
      id: comment.id,
      parentId: comment.parentId,
      status: comment.status,
      threadId: comment.threadId,
      updatedAt: comment.updatedAt,
    };
  }
}
