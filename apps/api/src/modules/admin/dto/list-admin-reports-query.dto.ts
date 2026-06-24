import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const adminReportStatuses = [
  'DISMISSED',
  'OPEN',
  'RESOLVED',
  'TRIAGED',
  'UNDER_REVIEW',
] as const;

export class ListAdminReportsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsInt()
  @IsOptional()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  limit = 50;

  @IsIn(adminReportStatuses)
  @IsOptional()
  status?: (typeof adminReportStatuses)[number];
}
