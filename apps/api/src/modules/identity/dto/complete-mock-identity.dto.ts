import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export type MockIdentityOutcome = 'verified' | 'rejected';

export class CompleteMockIdentityDto {
  @IsIn(['verified', 'rejected'])
  outcome!: MockIdentityOutcome;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  rejectionReasonCode?: string;
}
