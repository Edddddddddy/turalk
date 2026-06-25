import { Inject, Injectable } from '@nestjs/common';
import { ReportStatus } from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AdminRepository } from './admin.repository';
import type { AdminReportQueueRecord } from './admin.repository';
import type { ListAdminReportsQueryDto } from './dto/list-admin-reports-query.dto';
import type {
  AdminPublicUser,
  AdminReportQueueItem,
  PaginatedResult,
} from './admin.types';

@Injectable()
export class AdminService {
  constructor(
    @Inject(AdminRepository)
    private readonly adminRepository: AdminRepository,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  async listReports(
    actor: AuthenticatedUser,
    query: ListAdminReportsQueryDto,
  ): Promise<PaginatedResult<AdminReportQueueItem>> {
    const limit = query.limit;
    const records = await this.adminRepository.findReportQueue({
      cursor: query.cursor,
      limit,
      status: query.status ? ReportStatus[query.status] : undefined,
    });
    const hasNext = records.length > limit;
    const page = hasNext ? records.slice(0, limit) : records;

    await this.audit.record({
      action: 'ADMIN_REPORT_QUEUE_VIEWED',
      actorId: actor.userId,
      metadata: { status: query.status ?? null },
      resourceType: 'Report',
    });

    return {
      items: page.map((report) => this.toQueueItem(report)),
      nextCursor: hasNext ? (page.at(-1)?.id ?? null) : null,
    };
  }

  private toPublicUser(
    user: AdminReportQueueRecord['reporter'],
  ): AdminPublicUser {
    return {
      avatarUrl: user.profile?.avatarUrl ?? null,
      displayName: user.displayName,
      id: user.publicId,
    };
  }

  private toPreview(content: string | null | undefined): string {
    if (!content) {
      return '';
    }

    return content.length > 180 ? `${content.slice(0, 180)}...` : content;
  }

  private toQueueItem(report: AdminReportQueueRecord): AdminReportQueueItem {
    const threadTarget = report.thread
      ? {
          author: this.toPublicUser(report.thread.author),
          id: report.thread.id,
          preview: this.toPreview(report.thread.content),
          threadId: report.thread.id,
          title: report.thread.title,
          type: report.targetType,
        }
      : null;
    const commentTarget = report.comment
      ? {
          author: this.toPublicUser(report.comment.author),
          id: report.comment.id,
          preview: this.toPreview(report.comment.content),
          threadId: report.comment.threadId,
          title: null,
          type: report.targetType,
        }
      : null;
    const target = threadTarget ??
      commentTarget ?? {
        author: null,
        id: '',
        preview: '',
        threadId: null,
        title: null,
        type: report.targetType,
      };

    return {
      createdAt: report.createdAt,
      details: report.details,
      id: report.id,
      reasonCode: report.reasonCode,
      reporter: this.toPublicUser(report.reporter),
      reviewedBy: report.reviewedBy
        ? this.toPublicUser(report.reviewedBy)
        : null,
      status: report.status,
      target,
      updatedAt: report.updatedAt,
    };
  }
}
