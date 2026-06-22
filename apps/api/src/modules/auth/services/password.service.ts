import { createHmac } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { argon2id, hash, verify } from 'argon2';

@Injectable()
export class PasswordService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    return hash(this.applyPepper(password), {
      memoryCost: 19_456,
      parallelism: 1,
      timeCost: 2,
      type: argon2id,
    });
  }

  async verifyPassword(
    passwordHash: string | null | undefined,
    password: string,
  ): Promise<boolean> {
    if (!passwordHash) {
      await this.hashPassword('non-user-password');
      return false;
    }

    try {
      return await verify(passwordHash, this.applyPepper(password));
    } catch {
      return false;
    }
  }

  private applyPepper(password: string): string {
    const pepper = this.config.getOrThrow<string>('PASSWORD_HASH_PEPPER');
    return createHmac('sha256', pepper).update(password, 'utf8').digest('hex');
  }
}
