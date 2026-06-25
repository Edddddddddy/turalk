import { ReportStatus, ReportTargetType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';

const actor: AuthenticatedUser = {
  displayName: '审核员',
  publicId: 'public-admin-1',
  status: 'ACTIVE',
  userId: 'admin-1',
};

const reportRecord = {
  comment: null,
  createdAt: new Date('2026-06-24T08:00:00.000Z'),
  details: '疑似广告引流',
  id: 'report-1',
  reasonCode: 'SPAM',
  reporter: {
    displayName: '举报玩家',
    profile: { avatarUrl: null },
    publicId: 'public-reporter-1',
  },
  reviewedBy: null,
  status: ReportStatus.OPEN,
  targetType: ReportTargetType.THREAD,
  thread: {
    author: {
      displayName: '发帖玩家',
      profile: { avatarUrl: 'https://example.test/avatar.png' },
      publicId: 'public-author-1',
    },
    content: '这是一段被举报帖子的预览内容。',
    id: 'thread-1',
    title: '被举报的帖子',
  },
  updatedAt: new Date('2026-06-24T08:30:00.000Z'),
};

describe('AdminService', () => {
  const adminRepository = {
    findReportQueue: vi.fn(),
  };
  const audit = {
    record: vi.fn(async () => undefined),
  };
  const service = new AdminService(
    adminRepository as unknown as AdminRepository,
    audit as unknown as AuditService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists report queue items with only public user fields', async () => {
    adminRepository.findReportQueue.mockResolvedValue([reportRecord]);

    const result = await service.listReports(actor, {
      limit: 50,
      status: 'OPEN',
    });

    expect(adminRepository.findReportQueue).toHaveBeenCalledWith({
      cursor: undefined,
      limit: 50,
      status: ReportStatus.OPEN,
    });
    expect(result).toMatchObject({
      items: [
        {
          id: 'report-1',
          reporter: {
            displayName: '举报玩家',
            id: 'public-reporter-1',
          },
          status: ReportStatus.OPEN,
          target: {
            author: {
              displayName: '发帖玩家',
              id: 'public-author-1',
            },
            id: 'thread-1',
            threadId: 'thread-1',
            title: '被举报的帖子',
            type: ReportTargetType.THREAD,
          },
        },
      ],
      nextCursor: null,
    });
    expect(JSON.stringify(result)).not.toContain('admin-1');
    expect(JSON.stringify(result)).not.toContain('identityHash');
    expect(JSON.stringify(result)).not.toContain('providerSubjectToken');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'ADMIN_REPORT_QUEUE_VIEWED',
        actorId: 'admin-1',
        resourceType: 'Report',
      }),
    );
  });

  it('returns a cursor when there are more records than the requested limit', async () => {
    adminRepository.findReportQueue.mockResolvedValue([
      reportRecord,
      { ...reportRecord, id: 'report-2' },
    ]);

    const result = await service.listReports(actor, { limit: 1 });

    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBe('report-1');
  });
});
