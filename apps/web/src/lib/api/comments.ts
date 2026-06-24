import type { CommentDTO, PaginatedDTO } from '@turalk/types';

import { apiFetch } from './client';

export interface CreateCommentInput {
  content: string;
  parentId?: string;
  threadId: string;
}

export interface ListCommentsInput {
  cursor?: string;
  limit?: number;
  threadId: string;
}

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

function toQuery(input: ListCommentsInput): string {
  const params = new URLSearchParams({ threadId: input.threadId });

  if (input.cursor) {
    params.set('cursor', input.cursor);
  }

  if (input.limit) {
    params.set('limit', String(input.limit));
  }

  return `?${params.toString()}`;
}

export const commentsApi = {
  create(accessToken: string, input: CreateCommentInput): Promise<CommentDTO> {
    return apiFetch<CommentDTO>('/comments', {
      body: JSON.stringify(input),
      headers: bearer(accessToken),
      method: 'POST',
    });
  },

  delete(accessToken: string, commentId: string): Promise<{ deleted: true }> {
    return apiFetch<{ deleted: true }>(`/comments/${commentId}`, {
      headers: bearer(accessToken),
      method: 'DELETE',
    });
  },

  list(input: ListCommentsInput): Promise<PaginatedDTO<CommentDTO>> {
    return apiFetch<PaginatedDTO<CommentDTO>>(`/comments${toQuery(input)}`);
  },
};
