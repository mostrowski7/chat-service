import { IsUUID } from 'class-validator';

export class GetMessagesParamsDto {
  @IsUUID('4')
  id: string;
}
