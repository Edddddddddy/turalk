import { IsString } from 'class-validator';

export class CommentParamsDto {
  @IsString()
  commentId!: string;
}
