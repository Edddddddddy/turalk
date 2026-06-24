import type { ForumDTO } from '@turalk/types';

import { apiFetch } from './client';

export const forumsApi = {
  list(): Promise<ForumDTO[]> {
    return apiFetch<ForumDTO[]>('/forums');
  },
};
