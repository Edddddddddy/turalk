import { IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export const reportReasonCodes = [
  'SPAM',
  'HARASSMENT',
  'ILLEGAL_CONTENT',
  'PRIVACY_LEAK',
  'OFF_TOPIC',
  'OTHER',
] as const;

export type ReportReasonCode = (typeof reportReasonCodes)[number];

export class CreateReportDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;

  @IsIn(reportReasonCodes)
  reasonCode!: ReportReasonCode;

  @IsString()
  @Length(1, 128)
  targetId!: string;

  @IsIn(['COMMENT', 'THREAD'])
  targetType!: 'COMMENT' | 'THREAD';
}
