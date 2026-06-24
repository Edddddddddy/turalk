import type { ReportStatus, ReportTargetType } from '@prisma/client';

export interface ApiSuccess<T> {
  data: T;
  error: null;
  success: true;
}

export interface ReportResult {
  createdAt: Date;
  id: string;
  reasonCode: string;
  status: ReportStatus;
  targetId: string;
  targetType: ReportTargetType;
}

export function successResponse<T>(data: T): ApiSuccess<T> {
  return { data, error: null, success: true };
}
