import { Inject, Injectable } from '@nestjs/common';
import {
  ContentStatus,
  ReportStatus,
  ReportTargetType,
  VerificationStatus,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { CreateReportDto } from './dto/create-report.dto';

const reportSelect = {
  commentId: true,
  createdAt: true,
  id: true,
  reasonCode: true,
  status: true,
  targetType: true,
  threadId: true,
} as const;

const unresolvedStatuses = [
  ReportStatus.OPEN,
  ReportStatus.TRIAGED,
  ReportStatus.UNDER_REVIEW,
] as const;

@Injectable()
export class ReportsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createReport(reporterId: string, dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        comment:
          dto.targetType === ReportTargetType.COMMENT
            ? { connect: { id: dto.targetId } }
            : undefined,
        details: dto.details?.trim() || null,
        reasonCode: dto.reasonCode,
        reporter: { connect: { id: reporterId } },
        targetType: dto.targetType,
        thread:
          dto.targetType === ReportTargetType.THREAD
            ? { connect: { id: dto.targetId } }
            : undefined,
      },
      select: reportSelect,
    });
  }

  async findExistingUnresolvedReport(reporterId: string, dto: CreateReportDto) {
    return this.prisma.report.findFirst({
      select: { id: true },
      where: {
        reporterId,
        status: { in: [...unresolvedStatuses] },
        targetType: dto.targetType,
        ...(dto.targetType === ReportTargetType.THREAD
          ? { threadId: dto.targetId }
          : { commentId: dto.targetId }),
      },
    });
  }

  async findVisibleComment(commentId: string) {
    return this.prisma.comment.findFirst({
      select: { authorId: true, id: true, threadId: true },
      where: {
        deletedAt: null,
        id: commentId,
        status: ContentStatus.PUBLISHED,
        thread: {
          deletedAt: null,
          status: ContentStatus.PUBLISHED,
        },
      },
    });
  }

  async findVisibleThread(threadId: string) {
    return this.prisma.thread.findFirst({
      select: { authorId: true, id: true },
      where: {
        deletedAt: null,
        id: threadId,
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
