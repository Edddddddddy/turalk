import type { UserStatus } from '@prisma/client';

export interface AuthenticatedUser {
  displayName: string;
  publicId: string;
  status: UserStatus;
  userId: string;
}

export interface JwtTokenPayload {
  jti: string;
  publicId: string;
  sub: string;
  tokenType: 'access' | 'refresh';
}

export interface PublicAuthUser {
  avatarUrl: string | null;
  displayName: string;
  id: string;
  status: UserStatus;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends TokenPair {
  user: PublicAuthUser;
}

export interface ApiSuccess<T> {
  data: T;
  error: null;
  success: true;
}

export function successResponse<T>(data: T): ApiSuccess<T> {
  return { data, error: null, success: true };
}
