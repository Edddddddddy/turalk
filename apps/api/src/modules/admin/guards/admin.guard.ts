import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

import type { AuthenticatedUser } from '../../auth/auth.types';
import { AdminRepository } from '../admin.repository';
import { adminModerationRoles } from '../admin.types';

interface AdminRequest {
  user?: AuthenticatedUser;
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(AdminRepository) private readonly adminRepository: AdminRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();

    if (!request.user) {
      throw new ForbiddenException({
        code: 'ADMIN_REQUIRED',
        message: 'Administrator privileges are required',
      });
    }

    const allowed = await this.adminRepository.userHasAnyActiveRole(
      request.user.userId,
      [...adminModerationRoles],
    );

    if (!allowed) {
      throw new ForbiddenException({
        code: 'ADMIN_REQUIRED',
        message: 'Administrator privileges are required',
      });
    }

    return true;
  }
}
