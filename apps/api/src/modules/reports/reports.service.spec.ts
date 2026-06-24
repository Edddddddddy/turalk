import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReportStatus, ReportTargetType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuditService } from '../audit/audit.service';
import type { ReportsRepository } from './reports.repository';
import { ReportsService } from './reports.service';

const reportRecord = {
  commentId: null,
  createdAt: new Date('2026-06-24T08:00:00.000Z'),
  id: 'report-1',
  reasonCode: 'SPAM',
  status: ReportStatus.OPEN,
  targetType: ReportTargetType.THREAD,
  threadId: 'thread-1',
};

describe('ReportsService', () => {
  const audit = {
    record: vi.fn(async () => undefined),
  };
  const reportsRepository = {
    createReport: vi.fn(),
    findExistingUnresolvedReport: vi.fn(),
    findVisibleComment: vi.fn(),
    findVisibleThread: vi.fn(),
    userHasVerifiedIdentity: vi.fn(),
  };
  const service = new ReportsService(
    audit as unknown as AuditService,
    reportsRepository as unknown as ReportsRepository,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    reportsRepository.userHasVerifiedIdentity.mockResolvedValue(true);
  });

  it('rejects reports when identity is not verified', async () => {
    reportsRepository.userHasVerifiedIdentity.mockResolvedValue(false);

    const error = await service
      .createReport('reporter-1', {
        reasonCode: 'SPAM',
        targetId: 'thread-1',
        targetType: 'THREAD',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ForbiddenException);
    expect((error as ForbiddenException).getResponse()).toMatchObject({
      code: 'REPORT_REQUIRES_VERIFIED_IDENTITY',
    });
    expect(reportsRepository.findVisibleThread).not.toHaveBeenCalled();
  });

  it('creates a thread report and records audit event', async () => {
    reportsRepository.findVisibleThread.mockResolvedValue({
      authorId: 'author-1',
      id: 'thread-1',
    });
    reportsRepository.findExistingUnresolvedReport.mockResolvedValue(null);
    reportsRepository.createReport.mockResolvedValue(reportRecord);

    const result = await service.createReport('reporter-1', {
      reasonCode: 'SPAM',
      targetId: 'thread-1',
      targetType: 'THREAD',
    });

    expect(result).toMatchObject({
      id: 'report-1',
      reasonCode: 'SPAM',
      status: ReportStatus.OPEN,
      targetId: 'thread-1',
      targetType: ReportTargetType.THREAD,
    });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'REPORT_CREATED',
        actorId: 'reporter-1',
        resourceId: 'report-1',
      }),
    );
  });

  it('rejects reports for invisible targets', async () => {
    reportsRepository.findVisibleComment.mockResolvedValue(null);

    const error = await service
      .createReport('reporter-1', {
        reasonCode: 'HARASSMENT',
        targetId: 'comment-1',
        targetType: 'COMMENT',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(NotFoundException);
    expect((error as NotFoundException).getResponse()).toMatchObject({
      code: 'REPORT_TARGET_NOT_FOUND',
    });
    expect(reportsRepository.createReport).not.toHaveBeenCalled();
  });

  it('rejects duplicate unresolved reports from the same reporter', async () => {
    reportsRepository.findVisibleThread.mockResolvedValue({
      authorId: 'author-1',
      id: 'thread-1',
    });
    reportsRepository.findExistingUnresolvedReport.mockResolvedValue({
      id: 'report-existing',
    });

    const error = await service
      .createReport('reporter-1', {
        reasonCode: 'OTHER',
        targetId: 'thread-1',
        targetType: 'THREAD',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toMatchObject({
      code: 'REPORT_ALREADY_OPEN',
    });
    expect(reportsRepository.createReport).not.toHaveBeenCalled();
  });
});
