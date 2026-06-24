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

export interface PublicCommentAuthor {
  avatarUrl: string | null;
  displayName: string;
  id: string;
}

export interface CommentItem {
  author: PublicCommentAuthor;
  content: string;
  createdAt: Date;
  id: string;
  parentId: string | null;
  status: ContentStatus;
  threadId: string;
  updatedAt: Date;
}

export function successResponse<T>(data: T): ApiSuccess<T> {
  return { data, error: null, success: true };
}
