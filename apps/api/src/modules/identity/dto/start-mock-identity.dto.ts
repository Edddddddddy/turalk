import { Equals, IsBoolean, IsIn, IsOptional } from 'class-validator';

export class StartMockIdentityDto {
  @IsBoolean()
  @Equals(true, {
    message: 'consentAccepted must be true before starting verification',
  })
  consentAccepted!: boolean;

  @IsIn(['mock'])
  @IsOptional()
  provider?: 'mock';
}
