import type { ContentStatus } from '@prisma/client';

export interface ApiSuccess<T> {
  data: T;
  error: null;
  success: true;
}

export interface ForumSummary {
  description: string | null;
  id: string;
  name: string;
  position: number;
  slug: string;
  threadCount: number;
}

export interface ThreadSummary {
  author: {
    avatarUrl: string | null;
    displayName: string;
    id: string;
  };
  commentCount: number;
  contentPreview: string;
  createdAt: Date;
  forum: {
    name: string;
    slug: string;
  };
  id: string;
  status: ContentStatus;
  title: string;
  updatedAt: Date;
}

export function successResponse<T>(data: T): ApiSuccess<T> {
  return { data, error: null, success: true };
}
