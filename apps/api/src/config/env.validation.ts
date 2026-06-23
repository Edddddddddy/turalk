const secretKeys = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'PASSWORD_HASH_PEPPER',
] as const;

const rateLimitDefaults = {
  AUTH_LOGIN_LIMIT: 10,
  AUTH_LOGIN_TTL_SECONDS: 60,
  AUTH_REFRESH_LIMIT: 20,
  AUTH_REFRESH_TTL_SECONDS: 60,
  AUTH_REGISTER_LIMIT: 5,
  AUTH_REGISTER_TTL_SECONDS: 60,
} as const;

function requireSecret(
  config: Record<string, unknown>,
  key: (typeof secretKeys)[number],
): string {
  const value = config[key];

  if (typeof value !== 'string' || value.length < 32) {
    throw new Error(`${key} must contain at least 32 characters`);
  }

  return value;
}

function readPositiveInteger(
  config: Record<string, unknown>,
  key: keyof typeof rateLimitDefaults,
): number {
  const value = config[key] ?? rateLimitDefaults[key];
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${key} must be a positive integer`);
  }

  return parsed;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  for (const key of secretKeys) {
    requireSecret(config, key);
  }

  const rateLimits = Object.fromEntries(
    Object.keys(rateLimitDefaults).map((key) => [
      key,
      readPositiveInteger(config, key as keyof typeof rateLimitDefaults),
    ]),
  );

  return {
    ...config,
    ...rateLimits,
    JWT_ACCESS_EXPIRES_IN: config.JWT_ACCESS_EXPIRES_IN ?? '15m',
    JWT_REFRESH_EXPIRES_IN: config.JWT_REFRESH_EXPIRES_IN ?? '7d',
  };
}
