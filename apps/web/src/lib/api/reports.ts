import type {
  ReportDTO,
  ReportReasonCode,
  ReportTargetType,
} from '@turalk/types';

import { apiFetch } from './client';

export interface CreateReportInput {
  details?: string;
  reasonCode: ReportReasonCode;
  targetId: string;
  targetType: Extract<ReportTargetType, 'COMMENT' | 'THREAD'>;
}

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export const reportsApi = {
  create(accessToken: string, input: CreateReportInput): Promise<ReportDTO> {
    return apiFetch<ReportDTO>('/reports', {
      body: JSON.stringify(input),
      headers: bearer(accessToken),
      method: 'POST',
    });
  },
};
