import { IsString } from 'class-validator';

export class ThreadParamsDto {
  @IsString()
  threadId!: string;
}
