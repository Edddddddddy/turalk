import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListCommentsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsInt()
  @IsOptional()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  limit = 50;

  @IsString()
  threadId!: string;
}
