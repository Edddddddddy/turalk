import { Inject, Injectable } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { IdentityProviderCompletionResult } from './providers/identity-provider.interface';

const identityStatusSelect = {
  expiresAt: true,
  provider: true,
  rejectionReasonCode: true,
  status: true,
  updatedAt: true,
  verifiedAt: true,
} as const;

export type IdentityStatusRecord = Prisma.UserIdentityVerificationGetPayload<{
  select: typeof identityStatusSelect;
}>;

@Injectable()
export class IdentityRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findStatusByUserId(
    userId: string,
  ): Promise<IdentityStatusRecord | null> {
    return this.prisma.userIdentityVerification.findUnique({
      select: identityStatusSelect,
      where: { userId },
    });
  }

  async startMockVerification(input: {
    identityHash: string;
    provider: string;
    providerSubjectToken: string;
    userId: string;
  }): Promise<IdentityStatusRecord> {
    return this.prisma.userIdentityVerification.upsert({
      create: {
        identityHash: input.identityHash,
        provider: input.provider,
        providerSubjectToken: input.providerSubjectToken,
        status: VerificationStatus.PENDING,
        userId: input.userId,
      },
      select: identityStatusSelect,
      update: {
        expiresAt: null,
        identityHash: input.identityHash,
        provider: input.provider,
        providerSubjectToken: input.providerSubjectToken,
        rejectionReasonCode: null,
        status: VerificationStatus.PENDING,
        verifiedAt: null,
      },
      where: { userId: input.userId },
    });
  }

  async completeMockVerification(
    userId: string,
    completion: IdentityProviderCompletionResult & {
      status: VerificationStatus;
    },
  ): Promise<IdentityStatusRecord | null> {
    const current = await this.prisma.userIdentityVerification.findUnique({
      select: { id: true, provider: true },
      where: { userId },
    });

    if (!current || current.provider !== 'mock') {
      return null;
    }

    return this.prisma.userIdentityVerification.update({
      data: completion,
      select: identityStatusSelect,
      where: { userId },
    });
  }
}
