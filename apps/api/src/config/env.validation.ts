const secretKeys = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'PASSWORD_HASH_PEPPER',
] as const;

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

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  for (const key of secretKeys) {
    requireSecret(config, key);
  }

  return {
    ...config,
    JWT_ACCESS_EXPIRES_IN: config.JWT_ACCESS_EXPIRES_IN ?? '15m',
    JWT_REFRESH_EXPIRES_IN: config.JWT_REFRESH_EXPIRES_IN ?? '7d',
  };
}
