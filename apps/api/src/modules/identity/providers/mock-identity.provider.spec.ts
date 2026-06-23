import { describe, expect, it } from 'vitest';

import { MockIdentityProvider } from './mock-identity.provider';

describe('MockIdentityProvider', () => {
  it('starts verification with non-PII provider token and hash values', () => {
    const provider = new MockIdentityProvider();

    const result = provider.start('user-1');

    expect(result.provider).toBe('mock');
    expect(result.providerSubjectToken).toMatch(/^mock_/);
    expect(result.identityHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(result)).not.toContain('identityNumber');
  });

  it('completes verified and rejected outcomes without raw identity data', () => {
    const provider = new MockIdentityProvider();

    const verified = provider.complete('verified');
    const rejected = provider.complete('rejected', 'MOCK_MANUAL_REJECTED');

    expect(verified.verifiedAt).toBeInstanceOf(Date);
    expect(verified.expiresAt).toBeInstanceOf(Date);
    expect(rejected.verifiedAt).toBeNull();
    expect(rejected.rejectionReasonCode).toBe('MOCK_MANUAL_REJECTED');
  });
});
