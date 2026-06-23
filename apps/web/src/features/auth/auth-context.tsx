'use client';

import type { AuthResponseDTO, AuthUserDTO } from '@turalk/types';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import type { AuthCredentials, RegisterInput } from '../../lib/api/auth';
import { authApi } from '../../lib/api/auth';
import { ApiClientError } from '../../lib/api/client';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../../lib/auth/token-storage';

interface AuthContextValue {
  error: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  loadCurrentUser: () => Promise<void>;
  login: (input: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  register: (input: RegisterInput) => Promise<void>;
  user: AuthUserDTO | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function authErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.code === 'AUTH_INVALID_CREDENTIALS') {
      return '邮箱或密码不正确，请检查后再试。';
    }

    if (error.code === 'AUTH_EMAIL_ALREADY_REGISTERED') {
      return '这个邮箱已经注册过，可以直接登录。';
    }

    if (error.code === 'RATE_LIMITED') {
      return '操作太频繁了，请稍后再试。';
    }

    return error.message;
  }

  return '请求失败，请稍后再试。';
}

function persistSession(result: AuthResponseDTO): AuthUserDTO {
  setTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
  return result.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      setUser(null);
      return false;
    }

    try {
      const tokens = await authApi.refresh(refreshToken);
      setTokens(tokens);
      return true;
    } catch {
      clearTokens();
      setUser(null);
      return false;
    }
  }, []);

  const loadCurrentUser = useCallback(async (): Promise<void> => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setUser(await authApi.me(accessToken));
    } catch {
      const refreshed = await refreshSession();
      const nextAccessToken = getAccessToken();

      if (refreshed && nextAccessToken) {
        try {
          setUser(await authApi.me(nextAccessToken));
        } catch (nextError) {
          clearTokens();
          setUser(null);
          setError(authErrorMessage(nextError));
        }
      } else {
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [refreshSession]);

  const login = useCallback(async (input: AuthCredentials): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      setUser(persistSession(await authApi.login(input)));
    } catch (loginError) {
      setError(authErrorMessage(loginError));
      throw loginError;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      setUser(persistSession(await authApi.register(input)));
    } catch (registerError) {
      setError(authErrorMessage(registerError));
      throw registerError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    const accessToken = getAccessToken();
    setLoading(true);
    setError(null);

    try {
      if (accessToken) {
        await authApi.logout(accessToken);
      }
    } catch {
      // Local token clearing is still the safe user-facing outcome.
    } finally {
      clearTokens();
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      error,
      isAuthenticated: Boolean(user),
      loadCurrentUser,
      loading,
      login,
      logout,
      refreshSession,
      register,
      user,
    }),
    [
      error,
      loadCurrentUser,
      loading,
      login,
      logout,
      refreshSession,
      register,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
