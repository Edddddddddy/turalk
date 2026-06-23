import { NotFoundException } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuditService } from '../audit/audit.service';
import type { IdentityRepository } from './identity.repository';
import { IdentityService } from './identity.service';
import type { MockIdentityProvider } from './providers/mock-identity.provider';

describe('IdentityService', () => {
  const audit = {
    record: vi.fn(async () => undefined),
  };
  const identityRepository = {
    completeMockVerification: vi.fn(),
    findStatusByUserId: vi.fn(),
    startMockVerification: vi.fn(),
  };
  const provider = {
    complete: vi.fn(),
    start: vi.fn(),
  };
  const service = new IdentityService(
    audit as unknown as AuditService,
    identityRepository as unknown as IdentityRepository,
    provider as unknown as MockIdentityProvider,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a safe NOT_STARTED status when no verification exists', async () => {
    identityRepository.findStatusByUserId.mockResolvedValue(null);

    await expect(service.getStatus('user-1')).resolves.toEqual({
      expiresAt: null,
      provider: null,
      rejectionReasonCode: null,
      status: VerificationStatus.NOT_STARTED,
      updatedAt: null,
      verifiedAt: null,
    });
  });

  it('starts mock verification without exposing provider token or identity hash', async () => {
    provider.start.mockReturnValue({
      identityHash: 'hash-value',
      provider: 'mock',
      providerSubjectToken: 'mock-provider-token',
    });
    identityRepository.startMockVerification.mockResolvedValue({
      expiresAt: null,
      provider: 'mock',
      rejectionReasonCode: null,
      status: VerificationStatus.PENDING,
      updatedAt: new Date('2026-06-23T00:00:00.000Z'),
      verifiedAt: null,
    });

    const result = await service.startMockVerification('user-1');

    expect(identityRepository.startMockVerification).toHaveBeenCalledWith({
      identityHash: 'hash-value',
      provider: 'mock',
      providerSubjectToken: 'mock-provider-token',
      userId: 'user-1',
    });
    expect(JSON.stringify(result)).not.toContain('identityHash');
    expect(JSON.stringify(result)).not.toContain('providerSubjectToken');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'IDENTITY_MOCK_VERIFICATION_STARTED',
        actorId: 'user-1',
      }),
    );
  });

  it('completes mock verification and records audit event', async () => {
    const verifiedAt = new Date('2026-06-23T00:00:00.000Z');
    const expiresAt = new Date('2027-06-23T00:00:00.000Z');
    provider.complete.mockReturnValue({
      expiresAt,
      rejectionReasonCode: null,
      verifiedAt,
    });
    identityRepository.completeMockVerification.mockResolvedValue({
      expiresAt,
      provider: 'mock',
      rejectionReasonCode: null,
      status: VerificationStatus.VERIFIED,
      updatedAt: verifiedAt,
      verifiedAt,
    });

    const result = await service.completeMockVerification('user-1', 'verified');

    expect(result.status).toBe(VerificationStatus.VERIFIED);
    expect(identityRepository.completeMockVerification).toHaveBeenCalledWith(
      'user-1',
      {
        expiresAt,
        rejectionReasonCode: null,
        status: VerificationStatus.VERIFIED,
        verifiedAt,
      },
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'IDENTITY_MOCK_VERIFICATION_COMPLETED',
        actorId: 'user-1',
      }),
    );
  });

  it('throws a stable not-found error when no mock verification can be completed', async () => {
    provider.complete.mockReturnValue({
      expiresAt: null,
      rejectionReasonCode: 'MOCK_REJECTED',
      verifiedAt: null,
    });
    identityRepository.completeMockVerification.mockResolvedValue(null);

    const error = await service
      .completeMockVerification('user-1', 'rejected')
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(NotFoundException);
    expect((error as NotFoundException).getResponse()).toMatchObject({
      code: 'IDENTITY_VERIFICATION_NOT_FOUND',
    });
  });
});
