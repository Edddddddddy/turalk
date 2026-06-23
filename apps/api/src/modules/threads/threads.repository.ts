import { Inject, Injectable } from '@nestjs/common';
import { ContentStatus, VerificationStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { CreateThreadDto } from './dto/create-thread.dto';

const threadListSelect = {
  _count: {
    select: {
      comments: {
        where: {
          deletedAt: null,
          status: ContentStatus.PUBLISHED,
        },
      },
    },
  },
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
  forum: {
    select: {
      name: true,
      slug: true,
    },
  },
  id: true,
  status: true,
  title: true,
  updatedAt: true,
} as const;

@Injectable()
export class ThreadsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createThread(userId: string, dto: CreateThreadDto) {
    return this.prisma.thread.create({
      data: {
        author: { connect: { id: userId } },
        content: dto.content,
        forum: { connect: { slug: dto.forumSlug } },
        status: ContentStatus.PUBLISHED,
        title: dto.title,
      },
      select: threadListSelect,
    });
  }

  async findById(threadId: string) {
    return this.prisma.thread.findFirst({
      select: threadListSelect,
      where: {
        deletedAt: null,
        id: threadId,
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  async findForumBySlug(slug: string) {
    return this.prisma.forum.findFirst({
      select: { id: true, isActive: true, slug: true },
      where: { slug },
    });
  }

  async findPublishedThreads(input: {
    cursor?: string;
    forumSlug?: string;
    limit: number;
  }) {
    return this.prisma.thread.findMany({
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: threadListSelect,
      skip: input.cursor ? 1 : 0,
      take: input.limit + 1,
      where: {
        deletedAt: null,
        forum: input.forumSlug
          ? {
              isActive: true,
              slug: input.forumSlug,
            }
          : { isActive: true },
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  async userHasVerifiedIdentity(userId: string): Promise<boolean> {
    const verification = await this.prisma.userIdentityVerification.findUnique({
      select: { status: true },
      where: { userId },
    });

    return verification?.status === VerificationStatus.VERIFIED;
  }
}
