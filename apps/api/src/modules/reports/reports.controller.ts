import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// DTO classes must remain runtime imports for Nest validation metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';
import type { ApiSuccess, ReportResult } from './reports.types';
import { successResponse } from './reports.types';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(
    @Inject(ReportsService) private readonly reportsService: ReportsService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createReport(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReportDto,
  ): Promise<ApiSuccess<ReportResult>> {
    return successResponse(
      await this.reportsService.createReport(user.userId, dto),
    );
  }
}
