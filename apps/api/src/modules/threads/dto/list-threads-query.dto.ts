import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class ListThreadsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  forumSlug?: string;

  @IsInt()
  @IsOptional()
  @Max(50)
  @Min(1)
  @Type(() => Number)
  limit = 20;
}
