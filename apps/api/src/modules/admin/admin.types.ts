import type { AdminRole, ReportStatus, ReportTargetType } from '@prisma/client';

export interface ApiSuccess<T> {
  data: T;
  error: null;
  success: true;
}

export interface AdminPublicUser {
  avatarUrl: string | null;
  displayName: string;
  id: string;
}

export interface AdminReportQueueItem {
  createdAt: Date;
  details: string | null;
  id: string;
  reasonCode: string;
  reporter: AdminPublicUser;
  reviewedBy: AdminPublicUser | null;
  status: ReportStatus;
  target: {
    author: AdminPublicUser | null;
    id: string;
    preview: string;
    threadId: string | null;
    title: string | null;
    type: ReportTargetType;
  };
  updatedAt: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}

export const adminModerationRoles = [
  'ADMIN',
  'MODERATOR',
] satisfies AdminRole[];

export function successResponse<T>(data: T): ApiSuccess<T> {
  return { data, error: null, success: true };
}
