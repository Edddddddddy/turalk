import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuditService } from '../audit/audit.service';
import type { ThreadsRepository } from './threads.repository';
import { ThreadsService } from './threads.service';

const threadRecord = {
  _count: { comments: 0 },
  author: {
    displayName: '测试玩家',
    profile: { avatarUrl: null },
    publicId: 'public-player-1',
  },
  content: '这是一段用于测试的帖子正文，前台只展示公开昵称。',
  createdAt: new Date('2026-06-23T08:00:00.000Z'),
  forum: {
    name: '综合讨论',
    slug: 'general',
  },
  id: 'thread-1',
  status: ContentStatus.PUBLISHED,
  title: '测试帖子标题',
  updatedAt: new Date('2026-06-23T08:00:00.000Z'),
};

describe('ThreadsService', () => {
  const audit = {
    record: vi.fn(async () => undefined),
  };
  const threadsRepository = {
    createThread: vi.fn(),
    findById: vi.fn(),
    findForumBySlug: vi.fn(),
    findPublishedThreads: vi.fn(),
    userHasVerifiedIdentity: vi.fn(),
  };
  const service = new ThreadsService(
    audit as unknown as AuditService,
    threadsRepository as unknown as ThreadsRepository,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects thread creation when identity is not verified', async () => {
    threadsRepository.userHasVerifiedIdentity.mockResolvedValue(false);

    const error = await service
      .createThread('user-1', {
        content: 'content long enough',
        forumSlug: 'general',
        title: 'Valid title',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ForbiddenException);
    expect((error as ForbiddenException).getResponse()).toMatchObject({
      code: 'THREAD_REQUIRES_VERIFIED_IDENTITY',
    });
    expect(threadsRepository.createThread).not.toHaveBeenCalled();
  });

  it('creates a thread for a verified user and records audit event', async () => {
    threadsRepository.userHasVerifiedIdentity.mockResolvedValue(true);
    threadsRepository.findForumBySlug.mockResolvedValue({
      id: 'forum-1',
      isActive: true,
      slug: 'general',
    });
    threadsRepository.createThread.mockResolvedValue(threadRecord);

    const result = await service.createThread('internal-user-1', {
      content: threadRecord.content,
      forumSlug: 'general',
      title: threadRecord.title,
    });

    expect(result).toMatchObject({
      author: {
        displayName: '测试玩家',
        id: 'public-player-1',
      },
      commentCount: 0,
      forum: {
        slug: 'general',
      },
      id: 'thread-1',
      title: '测试帖子标题',
    });
    expect(JSON.stringify(result)).not.toContain('internal-user-1');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'THREAD_CREATED',
        actorId: 'internal-user-1',
        resourceId: 'thread-1',
      }),
    );
  });

  it('throws a stable not-found error for invisible threads', async () => {
    threadsRepository.findById.mockResolvedValue(null);

    const error = await service
      .getThread('missing-thread')
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(NotFoundException);
    expect((error as NotFoundException).getResponse()).toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
  });
});
