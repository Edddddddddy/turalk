import { Inject, Injectable } from '@nestjs/common';
import { ContentStatus, VerificationStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { CreateCommentDto } from './dto/create-comment.dto';

const commentSelect = {
  author: {
    select: {
      displayName: true,
      profile: {
        select: {
          avatarUrl: true,
        },
      },
      publicId: true,
    },
  },
  content: true,
  createdAt: true,
  id: true,
  parentId: true,
  status: true,
  threadId: true,
  updatedAt: true,
} as const;

@Injectable()
export class CommentsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createComment(userId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        author: { connect: { id: userId } },
        content: dto.content,
        parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
        status: ContentStatus.PUBLISHED,
        thread: { connect: { id: dto.threadId } },
      },
      select: commentSelect,
    });
  }

  async findPublishedComments(input: {
    cursor?: string;
    limit: number;
    threadId: string;
  }) {
    return this.prisma.comment.findMany({
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: commentSelect,
      skip: input.cursor ? 1 : 0,
      take: input.limit + 1,
      where: {
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        threadId: input.threadId,
      },
    });
  }

  async findPublishedComment(commentId: string) {
    return this.prisma.comment.findFirst({
      select: { id: true, threadId: true },
      where: {
        deletedAt: null,
        id: commentId,
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  async findVisibleThread(threadId: string) {
    return this.prisma.thread.findFirst({
      select: { id: true },
      where: {
        deletedAt: null,
        id: threadId,
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  async softDeleteOwnedComment(commentId: string, userId: string) {
    const result = await this.prisma.comment.updateMany({
      data: {
        deletedAt: new Date(),
        status: ContentStatus.DELETED,
      },
      where: {
        authorId: userId,
        deletedAt: null,
        id: commentId,
        status: ContentStatus.PUBLISHED,
      },
    });

    return result.count === 1;
  }

  async userHasVerifiedIdentity(userId: string): Promise<boolean> {
    const verification = await this.prisma.userIdentityVerification.findUnique({
      select: { status: true },
      where: { userId },
    });

    return verification?.status === VerificationStatus.VERIFIED;
  }
}
