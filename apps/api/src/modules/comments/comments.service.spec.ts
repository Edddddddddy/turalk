import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuditService } from '../audit/audit.service';
import type { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';

const commentRecord = {
  author: {
    displayName: '测试玩家',
    profile: { avatarUrl: null },
    publicId: 'public-player-1',
  },
  content: '这是一条评论。',
  createdAt: new Date('2026-06-24T08:00:00.000Z'),
  id: 'comment-1',
  parentId: null,
  status: ContentStatus.PUBLISHED,
  threadId: 'thread-1',
  updatedAt: new Date('2026-06-24T08:00:00.000Z'),
};

describe('CommentsService', () => {
  const audit = {
    record: vi.fn(async () => undefined),
  };
  const commentsRepository = {
    createComment: vi.fn(),
    findPublishedComment: vi.fn(),
    findPublishedComments: vi.fn(),
    findVisibleThread: vi.fn(),
    softDeleteOwnedComment: vi.fn(),
    userHasVerifiedIdentity: vi.fn(),
  };
  const service = new CommentsService(
    audit as unknown as AuditService,
    commentsRepository as unknown as CommentsRepository,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects comment creation when identity is not verified', async () => {
    commentsRepository.userHasVerifiedIdentity.mockResolvedValue(false);

    const error = await service
      .createComment('user-1', {
        content: 'content',
        threadId: 'thread-1',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ForbiddenException);
    expect((error as ForbiddenException).getResponse()).toMatchObject({
      code: 'COMMENT_REQUIRES_VERIFIED_IDENTITY',
    });
    expect(commentsRepository.createComment).not.toHaveBeenCalled();
  });

  it('creates a top-level comment for a verified user and records audit', async () => {
    commentsRepository.userHasVerifiedIdentity.mockResolvedValue(true);
    commentsRepository.findVisibleThread.mockResolvedValue({ id: 'thread-1' });
    commentsRepository.createComment.mockResolvedValue(commentRecord);

    const result = await service.createComment('internal-user-1', {
      content: '这是一条评论。',
      threadId: 'thread-1',
    });

    expect(result).toMatchObject({
      author: {
        displayName: '测试玩家',
        id: 'public-player-1',
      },
      id: 'comment-1',
      parentId: null,
      threadId: 'thread-1',
    });
    expect(JSON.stringify(result)).not.toContain('internal-user-1');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'COMMENT_CREATED',
        actorId: 'internal-user-1',
        resourceId: 'comment-1',
      }),
    );
  });

  it('rejects replies to comments outside the target thread', async () => {
    commentsRepository.userHasVerifiedIdentity.mockResolvedValue(true);
    commentsRepository.findVisibleThread.mockResolvedValue({ id: 'thread-1' });
    commentsRepository.findPublishedComment.mockResolvedValue({
      id: 'comment-parent',
      threadId: 'other-thread',
    });

    const error = await service
      .createComment('user-1', {
        content: 'reply',
        parentId: 'comment-parent',
        threadId: 'thread-1',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(NotFoundException);
    expect((error as NotFoundException).getResponse()).toMatchObject({
      code: 'COMMENT_PARENT_NOT_FOUND',
    });
    expect(commentsRepository.createComment).not.toHaveBeenCalled();
  });

  it('soft deletes an owned comment and records audit', async () => {
    commentsRepository.softDeleteOwnedComment.mockResolvedValue(true);

    await service.deleteComment('comment-1', 'user-1');

    expect(commentsRepository.softDeleteOwnedComment).toHaveBeenCalledWith(
      'comment-1',
      'user-1',
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'COMMENT_DELETED',
        actorId: 'user-1',
        resourceId: 'comment-1',
      }),
    );
  });
});
