import { Inject, Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { TokenPair } from './auth.types';

const publicUserSelect = {
  displayName: true,
  id: true,
  profile: {
    select: {
      avatarUrl: true,
    },
  },
  publicId: true,
  status: true,
} as const;

interface NewSession {
  refreshTokenHash: string;
  tokens: TokenPair;
}

type SessionFactory = (userId: string, publicId: string) => Promise<NewSession>;

@Injectable()
export class AuthRepository {
  constructor(
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async createUserWithSession(
    email: string,
    passwordHash: string,
    displayName: string,
    createSession: SessionFactory,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          auth: {
            create: {
              email,
              passwordHash,
            },
          },
          displayName,
          profile: {
            create: {},
          },
          status: UserStatus.ACTIVE,
        },
        select: publicUserSelect,
      });
      const session = await createSession(user.id, user.publicId);

      await transaction.userAuth.update({
        data: { refreshTokenHash: session.refreshTokenHash },
        where: { userId: user.id },
      });
      await this.audit.record(
        {
          action: 'AUTH_REGISTER_SUCCEEDED',
          actorId: user.id,
          resourceId: user.id,
          resourceType: 'User',
        },
        transaction,
      );

      return { tokens: session.tokens, user };
    });
  }

  async findAuthByEmail(email: string) {
    return this.prisma.userAuth.findUnique({
      where: { email },
      select: {
        passwordHash: true,
        refreshTokenHash: true,
        user: {
          select: publicUserSelect,
        },
        userId: true,
      },
    });
  }

  async findAuthByUserId(userId: string) {
    return this.prisma.userAuth.findUnique({
      where: { userId },
      select: {
        refreshTokenHash: true,
        user: {
          select: publicUserSelect,
        },
        userId: true,
      },
    });
  }

  async findActiveUser(userId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        status: UserStatus.ACTIVE,
      },
      select: publicUserSelect,
    });
  }

  async updateLoginSession(
    userId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.userAuth.update({
        data: {
          lastLoginAt: new Date(),
          refreshTokenHash,
        },
        where: { userId },
      });
      await this.audit.record(
        {
          action: 'AUTH_LOGIN_SUCCEEDED',
          actorId: userId,
          resourceId: userId,
          resourceType: 'User',
        },
        transaction,
      );
    });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.userAuth.updateMany({
        data: { refreshTokenHash: null },
        where: { userId },
      });
      await this.audit.record(
        {
          action: 'AUTH_LOGOUT_SUCCEEDED',
          actorId: userId,
          resourceId: userId,
          resourceType: 'User',
        },
        transaction,
      );
    });
  }

  async rotateRefreshToken(
    userId: string,
    currentHash: string,
    nextHash: string,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.userAuth.updateMany({
        data: { refreshTokenHash: nextHash },
        where: {
          refreshTokenHash: currentHash,
          userId,
        },
      });

      if (result.count === 1) {
        await this.audit.record(
          {
            action: 'AUTH_TOKEN_REFRESHED',
            actorId: userId,
            resourceId: userId,
            resourceType: 'User',
          },
          transaction,
        );
      }

      return result.count === 1;
    });
  }
}
