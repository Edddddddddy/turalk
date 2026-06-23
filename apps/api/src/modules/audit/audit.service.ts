import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

export interface AuditEvent {
  action: string;
  actorId?: string;
  metadata?: Prisma.InputJsonValue;
  resourceId?: string;
  resourceType: string;
}

type AuditClient = Pick<PrismaService, 'auditLog'>;

@Injectable()
export class AuditService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async record(
    event: AuditEvent,
    client: AuditClient = this.prisma,
  ): Promise<void> {
    await client.auditLog.create({
      data: {
        action: event.action,
        actorId: event.actorId,
        metadata: event.metadata,
        resourceId: event.resourceId,
        resourceType: event.resourceType,
      },
    });
  }
}
