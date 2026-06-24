import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import type { CreateThreadDto } from './dto/create-thread.dto';
import type { ListThreadsQueryDto } from './dto/list-threads-query.dto';
import { ThreadsRepository } from './threads.repository';
import type {
  PaginatedResult,
  ThreadDetail,
  ThreadListItem,
} from './threads.types';

type ThreadRecord = Awaited<ReturnType<ThreadsRepository['findById']>>;
type ThreadListRecord = NonNullable<ThreadRecord>;

@Injectable()
export class ThreadsService {
  constructor(
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(ThreadsRepository)
    private readonly threadsRepository: ThreadsRepository,
  ) {}

  async createThread(
    userId: string,
    dto: CreateThreadDto,
  ): Promise<ThreadDetail> {
    const verified =
      await this.threadsRepository.userHasVerifiedIdentity(userId);

    if (!verified) {
      throw new ForbiddenException({
        code: 'THREAD_REQUIRES_VERIFIED_IDENTITY',
        message: 'Verified identity is required before publishing threads',
      });
    }

    const forum = await this.threadsRepository.findForumBySlug(dto.forumSlug);

    if (!forum?.isActive) {
      throw new NotFoundException({
        code: 'FORUM_NOT_FOUND',
        message: 'Forum does not exist or is inactive',
      });
    }

    try {
      const thread = await this.threadsRepository.createThread(userId, dto);

      await this.audit.record({
        action: 'THREAD_CREATED',
        actorId: userId,
        metadata: { forumSlug: dto.forumSlug },
        resourceId: thread.id,
        resourceType: 'Thread',
      });

      return this.toThreadDetail(thread);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException({
          code: 'FORUM_NOT_FOUND',
          message: 'Forum does not exist or is inactive',
        });
      }

      throw error;
    }
  }

  async getThread(threadId: string): Promise<ThreadDetail> {
    const thread = await this.threadsRepository.findById(threadId);

    if (!thread) {
      throw new NotFoundException({
        code: 'THREAD_NOT_FOUND',
        message: 'Thread does not exist or is not visible',
      });
    }

    return this.toThreadDetail(thread);
  }

  async listThreads(
    query: ListThreadsQueryDto,
  ): Promise<PaginatedResult<ThreadListItem>> {
    const limit = query.limit;
    const records = await this.threadsRepository.findPublishedThreads({
      cursor: query.cursor,
      forumSlug: query.forumSlug,
      limit,
    });
    const hasNext = records.length > limit;
    const page = hasNext ? records.slice(0, limit) : records;

    return {
      items: page.map((thread) => this.toThreadListItem(thread)),
      nextCursor: hasNext ? (page.at(-1)?.id ?? null) : null,
    };
  }

  private toThreadDetail(thread: ThreadListRecord): ThreadDetail {
    return {
      ...this.toThreadListItem(thread),
      content: thread.content,
    };
  }

  private toThreadListItem(thread: ThreadListRecord): ThreadListItem {
    return {
      author: {
        avatarUrl: thread.author.profile?.avatarUrl ?? null,
        displayName: thread.author.displayName,
        id: thread.author.publicId,
      },
      commentCount: thread._count.comments,
      contentPreview: this.toPreview(thread.content),
      createdAt: thread.createdAt,
      forum: thread.forum,
      id: thread.id,
      status: thread.status,
      title: thread.title,
      updatedAt: thread.updatedAt,
    };
  }

  private toPreview(content: string): string {
    return content.length > 160 ? `${content.slice(0, 160)}...` : content;
  }
}
