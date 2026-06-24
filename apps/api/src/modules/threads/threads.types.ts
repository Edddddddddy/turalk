import type { ContentStatus } from '@prisma/client';

export interface ApiSuccess<T> {
  data: T;
  error: null;
  success: true;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PublicThreadAuthor {
  avatarUrl: string | null;
  displayName: string;
  id: string;
}

export interface PublicThreadForum {
  name: string;
  slug: string;
}

export interface ThreadListItem {
  author: PublicThreadAuthor;
  commentCount: number;
  contentPreview: string;
  createdAt: Date;
  forum: PublicThreadForum;
  id: string;
  status: ContentStatus;
  title: string;
  updatedAt: Date;
}

export interface ThreadDetail extends ThreadListItem {
  content: string;
}

export function successResponse<T>(data: T): ApiSuccess<T> {
  return { data, error: null, success: true };
}
