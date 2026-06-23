import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateThreadDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  forumSlug!: string;

  @IsString()
  @Length(4, 80)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content!: string;
}
