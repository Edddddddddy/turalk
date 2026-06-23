import type { MockIdentityOutcome } from '../dto/complete-mock-identity.dto';

export interface IdentityProviderStartResult {
  identityHash: string;
  provider: 'mock' | string;
  providerSubjectToken: string;
}

export interface IdentityProviderCompletionResult {
  expiresAt: Date | null;
  rejectionReasonCode: string | null;
  verifiedAt: Date | null;
}

export interface IdentityProvider {
  complete(
    outcome: MockIdentityOutcome,
    reason?: string,
  ): IdentityProviderCompletionResult;
  start(userId: string): IdentityProviderStartResult;
}
