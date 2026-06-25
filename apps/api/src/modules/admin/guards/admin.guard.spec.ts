import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminRepository } from '../admin.repository';
import { AdminGuard } from './admin.guard';

function createHttpContext(user?: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as ExecutionContext;
}

describe('AdminGuard', () => {
  const adminRepository = {
    userHasAnyActiveRole: vi.fn(),
  };
  const guard = new AdminGuard(adminRepository as unknown as AdminRepository);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows users with an active moderation role', async () => {
    adminRepository.userHasAnyActiveRole.mockResolvedValue(true);

    const allowed = await guard.canActivate(
      createHttpContext({ userId: 'admin-1' }),
    );

    expect(allowed).toBe(true);
    expect(adminRepository.userHasAnyActiveRole).toHaveBeenCalledWith(
      'admin-1',
      ['ADMIN', 'MODERATOR'],
    );
  });

  it('rejects authenticated users without an active moderation role', async () => {
    adminRepository.userHasAnyActiveRole.mockResolvedValue(false);

    const error = await guard
      .canActivate(createHttpContext({ userId: 'user-1' }))
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ForbiddenException);
    expect((error as ForbiddenException).getResponse()).toMatchObject({
      code: 'ADMIN_REQUIRED',
    });
  });

  it('rejects requests without an authenticated user', async () => {
    const error = await guard
      .canActivate(createHttpContext())
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ForbiddenException);
    expect(adminRepository.userHasAnyActiveRole).not.toHaveBeenCalled();
  });
});
