import type {
  AuthResponseDTO,
  AuthTokensDTO,
  AuthUserDTO,
} from '@turalk/types';

import { apiFetch } from './client';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterInput extends AuthCredentials {
  nickname: string;
}

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export const authApi = {
  login(input: AuthCredentials): Promise<AuthResponseDTO> {
    return apiFetch<AuthResponseDTO>('/auth/login', {
      body: JSON.stringify(input),
      method: 'POST',
    });
  },

  logout(accessToken: string): Promise<{ loggedOut: true }> {
    return apiFetch<{ loggedOut: true }>('/auth/logout', {
      headers: bearer(accessToken),
      method: 'POST',
    });
  },

  me(accessToken: string): Promise<AuthUserDTO> {
    return apiFetch<AuthUserDTO>('/auth/me', {
      headers: bearer(accessToken),
    });
  },

  refresh(refreshToken: string): Promise<AuthTokensDTO> {
    return apiFetch<AuthTokensDTO>('/auth/refresh', {
      body: JSON.stringify({ refreshToken }),
      method: 'POST',
    });
  },

  register(input: RegisterInput): Promise<AuthResponseDTO> {
    return apiFetch<AuthResponseDTO>('/auth/register', {
      body: JSON.stringify(input),
      method: 'POST',
    });
  },
};
