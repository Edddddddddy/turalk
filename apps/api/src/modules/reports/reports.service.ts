import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import type { CreateReportDto } from './dto/create-report.dto';
import { ReportsRepository } from './reports.repository';
import type { ReportResult } from './reports.types';

type ReportRecord = Awaited<ReturnType<ReportsRepository['createReport']>>;

@Injectable()
export class ReportsService {
  constructor(
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(ReportsRepository)
    private readonly reportsRepository: ReportsRepository,
  ) {}

  async createReport(
    reporterId: string,
    dto: CreateReportDto,
  ): Promise<ReportResult> {
    const verified =
      await this.reportsRepository.userHasVerifiedIdentity(reporterId);

    if (!verified) {
      throw new ForbiddenException({
        code: 'REPORT_REQUIRES_VERIFIED_IDENTITY',
        message: 'Verified identity is required before reporting content',
      });
    }

    await this.assertTargetVisible(dto);

    const existing = await this.reportsRepository.findExistingUnresolvedReport(
      reporterId,
      dto,
    );

    if (existing) {
      throw new ConflictException({
        code: 'REPORT_ALREADY_OPEN',
        message: 'An unresolved report already exists for this target',
      });
    }

    const report = await this.reportsRepository.createReport(reporterId, dto);

    await this.audit.record({
      action: 'REPORT_CREATED',
      actorId: reporterId,
      metadata: {
        reasonCode: dto.reasonCode,
        targetId: dto.targetId,
        targetType: dto.targetType,
      },
      resourceId: report.id,
      resourceType: 'Report',
    });

    return this.toReportResult(report);
  }

  private async assertTargetVisible(dto: CreateReportDto): Promise<void> {
    if (dto.targetType === 'THREAD') {
      const thread = await this.reportsRepository.findVisibleThread(
        dto.targetId,
      );

      if (!thread) {
        throw this.targetNotFound();
      }

      return;
    }

    const comment = await this.reportsRepository.findVisibleComment(
      dto.targetId,
    );

    if (!comment) {
      throw this.targetNotFound();
    }
  }

  private targetNotFound(): NotFoundException {
    return new NotFoundException({
      code: 'REPORT_TARGET_NOT_FOUND',
      message: 'Report target does not exist or is not visible',
    });
  }

  private toReportResult(report: ReportRecord): ReportResult {
    return {
      createdAt: report.createdAt,
      id: report.id,
      reasonCode: report.reasonCode,
      status: report.status,
      targetId: report.threadId ?? report.commentId ?? '',
      targetType: report.targetType,
    };
  }
}
