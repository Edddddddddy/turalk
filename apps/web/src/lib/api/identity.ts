import type { IdentityVerificationStatusDTO } from '@turalk/types';

import { apiFetch } from './client';

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export const identityApi = {
  completeMock(
    accessToken: string,
    outcome: 'rejected' | 'verified',
  ): Promise<IdentityVerificationStatusDTO> {
    return apiFetch<IdentityVerificationStatusDTO>('/identity/mock/complete', {
      body: JSON.stringify({ outcome }),
      headers: bearer(accessToken),
      method: 'POST',
    });
  },

  getStatus(accessToken: string): Promise<IdentityVerificationStatusDTO> {
    return apiFetch<IdentityVerificationStatusDTO>('/identity/status', {
      headers: bearer(accessToken),
    });
  },

  startMock(accessToken: string): Promise<IdentityVerificationStatusDTO> {
    return apiFetch<IdentityVerificationStatusDTO>('/identity/mock/start', {
      body: JSON.stringify({ consentAccepted: true, provider: 'mock' }),
      headers: bearer(accessToken),
      method: 'POST',
    });
  },
};
