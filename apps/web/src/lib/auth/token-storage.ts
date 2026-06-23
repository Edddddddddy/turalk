const accessTokenKey = 'turalk.accessToken';
const refreshTokenKey = 'turalk.refreshToken';

// Development-stage MVP: localStorage keeps the flow simple, but it is exposed
// to XSS. Production should move to httpOnly secure cookies plus CSRF defenses
// or a stricter server-side session design.
function browserStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function getAccessToken(): string | null {
  return browserStorage()?.getItem(accessTokenKey) ?? null;
}

export function setAccessToken(token: string): void {
  browserStorage()?.setItem(accessTokenKey, token);
}

export function getRefreshToken(): string | null {
  return browserStorage()?.getItem(refreshTokenKey) ?? null;
}

export function setRefreshToken(token: string): void {
  browserStorage()?.setItem(refreshTokenKey, token);
}

export function clearTokens(): void {
  const storage = browserStorage();

  storage?.removeItem(accessTokenKey);
  storage?.removeItem(refreshTokenKey);
}

export function setTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): void {
  setAccessToken(tokens.accessToken);
  setRefreshToken(tokens.refreshToken);
}
