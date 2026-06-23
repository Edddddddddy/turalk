import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import type { MockIdentityOutcome } from './dto/complete-mock-identity.dto';
import { IdentityRepository } from './identity.repository';
import type { IdentityStatusRecord } from './identity.repository';
import type { IdentityVerificationStatus } from './identity.types';
import { MockIdentityProvider } from './providers/mock-identity.provider';

@Injectable()
export class IdentityService {
  constructor(
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(IdentityRepository)
    private readonly identityRepository: IdentityRepository,
    @Inject(MockIdentityProvider)
    private readonly mockProvider: MockIdentityProvider,
  ) {}

  async getStatus(userId: string): Promise<IdentityVerificationStatus> {
    return this.toStatus(
      await this.identityRepository.findStatusByUserId(userId),
    );
  }

  async startMockVerification(
    userId: string,
  ): Promise<IdentityVerificationStatus> {
    const providerResult = this.mockProvider.start(userId);
    const record = await this.identityRepository.startMockVerification({
      identityHash: providerResult.identityHash,
      provider: providerResult.provider,
      providerSubjectToken: providerResult.providerSubjectToken,
      userId,
    });

    await this.audit.record({
      action: 'IDENTITY_MOCK_VERIFICATION_STARTED',
      actorId: userId,
      metadata: { provider: 'mock' },
      resourceId: userId,
      resourceType: 'UserIdentityVerification',
    });

    return this.toStatus(record);
  }

  async completeMockVerification(
    userId: string,
    outcome: MockIdentityOutcome,
    rejectionReasonCode?: string,
  ): Promise<IdentityVerificationStatus> {
    const status =
      outcome === 'verified'
        ? VerificationStatus.VERIFIED
        : VerificationStatus.REJECTED;
    const completion = this.mockProvider.complete(outcome, rejectionReasonCode);
    const record = await this.identityRepository.completeMockVerification(
      userId,
      {
        ...completion,
        status,
      },
    );

    if (!record) {
      throw new NotFoundException({
        code: 'IDENTITY_VERIFICATION_NOT_FOUND',
        message: 'No mock identity verification is available to complete',
      });
    }

    await this.audit.record({
      action: 'IDENTITY_MOCK_VERIFICATION_COMPLETED',
      actorId: userId,
      metadata: { outcome, provider: 'mock' },
      resourceId: userId,
      resourceType: 'UserIdentityVerification',
    });

    return this.toStatus(record);
  }

  private toStatus(
    record: IdentityStatusRecord | null,
  ): IdentityVerificationStatus {
    if (!record) {
      return {
        expiresAt: null,
        provider: null,
        rejectionReasonCode: null,
        status: VerificationStatus.NOT_STARTED,
        updatedAt: null,
        verifiedAt: null,
      };
    }

    return {
      expiresAt: record.expiresAt,
      provider: record.provider,
      rejectionReasonCode: record.rejectionReasonCode,
      status: record.status,
      updatedAt: record.updatedAt,
      verifiedAt: record.verifiedAt,
    };
  }
}
