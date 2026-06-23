import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// DTO classes must remain runtime imports for Nest validation metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CompleteMockIdentityDto } from './dto/complete-mock-identity.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { StartMockIdentityDto } from './dto/start-mock-identity.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { IdentityService } from './identity.service';
import type { ApiSuccess, IdentityVerificationStatus } from './identity.types';
import { successResponse } from './identity.types';

@Controller('identity')
@UseGuards(JwtAuthGuard)
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Get('status')
  async getStatus(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiSuccess<IdentityVerificationStatus>> {
    return successResponse(await this.identityService.getStatus(user.userId));
  }

  @HttpCode(HttpStatus.OK)
  @Post('mock/start')
  async startMockVerification(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartMockIdentityDto,
  ): Promise<ApiSuccess<IdentityVerificationStatus>> {
    void dto;

    return successResponse(
      await this.identityService.startMockVerification(user.userId),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('mock/complete')
  async completeMockVerification(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CompleteMockIdentityDto,
  ): Promise<ApiSuccess<IdentityVerificationStatus>> {
    return successResponse(
      await this.identityService.completeMockVerification(
        user.userId,
        dto.outcome,
        dto.rejectionReasonCode,
      ),
    );
  }
}
