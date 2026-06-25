import { Inject, Injectable } from '@nestjs/common';
import type { AdminRole, ReportStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

const publicUserSelect = {
  displayName: true,
  profile: {
    select: {
      avatarUrl: true,
    },
  },
  publicId: true,
} as const;

const reportQueueSelect = {
  comment: {
    select: {
      author: {
        select: publicUserSelect,
      },
      content: true,
      id: true,
      threadId: true,
    },
  },
  createdAt: true,
  details: true,
  id: true,
  reasonCode: true,
  reporter: {
    select: publicUserSelect,
  },
  reviewedBy: {
    select: publicUserSelect,
  },
  status: true,
  targetType: true,
  thread: {
    select: {
      author: {
        select: publicUserSelect,
      },
      content: true,
      id: true,
      title: true,
    },
  },
  updatedAt: true,
} as const;

@Injectable()
export class AdminRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findReportQueue(input: {
    cursor?: string;
    limit: number;
    status?: ReportStatus;
  }) {
    return this.prisma.report.findMany({
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: reportQueueSelect,
      skip: input.cursor ? 1 : 0,
      take: input.limit + 1,
      where: input.status ? { status: input.status } : undefined,
    });
  }

  async userHasAnyActiveRole(userId: string, roles: AdminRole[]) {
    const assignment = await this.prisma.adminRoleAssignment.findFirst({
      select: { id: true },
      where: {
        isActive: true,
        role: { in: roles },
        userId,
      },
    });

    return Boolean(assignment);
  }
}

export type AdminReportQueueRecord = Awaited<
  ReturnType<AdminRepository['findReportQueue']>
>[number];
