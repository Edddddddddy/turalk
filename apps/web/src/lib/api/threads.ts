import type { PaginatedDTO, ThreadDTO, ThreadListItemDTO } from '@turalk/types';

import { apiFetch } from './client';

export interface CreateThreadInput {
  content: string;
  forumSlug: string;
  title: string;
}

export interface ListThreadsInput {
  cursor?: string;
  forumSlug?: string;
  limit?: number;
}

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

function toQuery(input: ListThreadsInput): string {
  const params = new URLSearchParams();

  if (input.cursor) {
    params.set('cursor', input.cursor);
  }

  if (input.forumSlug) {
    params.set('forumSlug', input.forumSlug);
  }

  if (input.limit) {
    params.set('limit', String(input.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export const threadsApi = {
  create(accessToken: string, input: CreateThreadInput): Promise<ThreadDTO> {
    return apiFetch<ThreadDTO>('/threads', {
      body: JSON.stringify(input),
      headers: bearer(accessToken),
      method: 'POST',
    });
  },

  get(threadId: string): Promise<ThreadDTO> {
    return apiFetch<ThreadDTO>(`/threads/${threadId}`);
  },

  list(input: ListThreadsInput = {}): Promise<PaginatedDTO<ThreadListItemDTO>> {
    return apiFetch<PaginatedDTO<ThreadListItemDTO>>(
      `/threads${toQuery(input)}`,
    );
  },
};
