import { createHash, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import type { MockIdentityOutcome } from '../dto/complete-mock-identity.dto';
import type {
  IdentityProvider,
  IdentityProviderCompletionResult,
  IdentityProviderStartResult,
} from './identity-provider.interface';

@Injectable()
export class MockIdentityProvider implements IdentityProvider {
  complete(
    outcome: MockIdentityOutcome,
    reason?: string,
  ): IdentityProviderCompletionResult {
    if (outcome === 'rejected') {
      return {
        expiresAt: null,
        rejectionReasonCode: reason ?? 'MOCK_REJECTED',
        verifiedAt: null,
      };
    }

    const verifiedAt = new Date();
    const expiresAt = new Date(verifiedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return {
      expiresAt,
      rejectionReasonCode: null,
      verifiedAt,
    };
  }

  start(userId: string): IdentityProviderStartResult {
    const providerSubjectToken = `mock_${randomUUID()}`;
    const identityHash = createHash('sha256')
      .update(`mock:${userId}:${providerSubjectToken}`, 'utf8')
      .digest('hex');

    return {
      identityHash,
      provider: 'mock',
      providerSubjectToken,
    };
  }
}
