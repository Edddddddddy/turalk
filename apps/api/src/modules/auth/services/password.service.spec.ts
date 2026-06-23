import type { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';

import { PasswordService } from './password.service';

function createPasswordService(pepper: string): PasswordService {
  const config = {
    getOrThrow: vi.fn((key: string) => {
      if (key !== 'PASSWORD_HASH_PEPPER') {
        throw new Error(`Unexpected config key: ${key}`);
      }

      return pepper;
    }),
  } as Pick<ConfigService, 'getOrThrow'>;

  return new PasswordService(config as ConfigService);
}

describe('PasswordService', () => {
  it('hashPassword returns a non-plaintext Argon2id hash', async () => {
    const service = createPasswordService(
      'test-pepper-value-at-least-32-chars',
    );
    const password = 'examplePassword123';

    const passwordHash = await service.hashPassword(password);

    expect(passwordHash).not.toBe(password);
    expect(passwordHash).toContain('$argon2id$');
  });

  it('verifyPassword returns true for the correct password', async () => {
    const service = createPasswordService(
      'test-pepper-value-at-least-32-chars',
    );
    const passwordHash = await service.hashPassword('examplePassword123');

    await expect(
      service.verifyPassword(passwordHash, 'examplePassword123'),
    ).resolves.toBe(true);
  });

  it('verifyPassword returns false for the wrong password', async () => {
    const service = createPasswordService(
      'test-pepper-value-at-least-32-chars',
    );
    const passwordHash = await service.hashPassword('examplePassword123');

    await expect(
      service.verifyPassword(passwordHash, 'wrongPassword123'),
    ).resolves.toBe(false);
  });

  it('uses pepper consistently during hash and verify', async () => {
    const password = 'examplePassword123';
    const passwordHash = await createPasswordService(
      'test-pepper-value-at-least-32-chars',
    ).hashPassword(password);

    await expect(
      createPasswordService(
        'test-pepper-value-at-least-32-chars',
      ).verifyPassword(passwordHash, password),
    ).resolves.toBe(true);
    await expect(
      createPasswordService(
        'different-pepper-value-at-least-32-chars',
      ).verifyPassword(passwordHash, password),
    ).resolves.toBe(false);
  });
});
