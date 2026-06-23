import type { VerificationStatus } from '@prisma/client';

export interface IdentityVerificationStatus {
  expiresAt: Date | null;
  provider: 'mock' | string | null;
  rejectionReasonCode: string | null;
  status: VerificationStatus;
  updatedAt: Date | null;
  verifiedAt: Date | null;
}

export interface ApiSuccess<T> {
  data: T;
  error: null;
  success: true;
}

export function successResponse<T>(data: T): ApiSuccess<T> {
  return { data, error: null, success: true };
}
