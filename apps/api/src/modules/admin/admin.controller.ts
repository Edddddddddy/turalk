import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import type {
  ApiSuccess,
  AdminReportQueueItem,
  PaginatedResult,
} from './admin.types';
import { successResponse } from './admin.types';
// DTO classes must remain runtime imports for Nest validation metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ListAdminReportsQueryDto } from './dto/list-admin-reports-query.dto';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    @Inject(AdminService) private readonly adminService: AdminService,
  ) {}

  @Get('reports')
  async listReports(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListAdminReportsQueryDto,
  ): Promise<ApiSuccess<PaginatedResult<AdminReportQueueItem>>> {
    return successResponse(await this.adminService.listReports(user, query));
  }
}
