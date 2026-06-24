import { Inject, Injectable } from '@nestjs/common';

import { ForumsRepository } from './forums.repository';
import type { ForumSummary } from './forums.types';

@Injectable()
export class ForumsService {
  constructor(
    @Inject(ForumsRepository)
    private readonly forumsRepository: ForumsRepository,
  ) {}

  async listForums(): Promise<ForumSummary[]> {
    const forums = await this.forumsRepository.findActiveForums();

    return forums.map((forum) => ({
      description: forum.description,
      id: forum.id,
      name: forum.name,
      position: forum.position,
      slug: forum.slug,
      threadCount: forum._count.threads,
    }));
  }
}
