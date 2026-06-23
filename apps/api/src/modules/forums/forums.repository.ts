import { Inject, Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ForumsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findActiveForums() {
    return this.prisma.forum.findMany({
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: {
        _count: {
          select: {
            threads: {
              where: {
                deletedAt: null,
                status: ContentStatus.PUBLISHED,
              },
            },
          },
        },
        description: true,
        id: true,
        name: true,
        position: true,
        slug: true,
      },
      where: { isActive: true },
    });
  }
}
