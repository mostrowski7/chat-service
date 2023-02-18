import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetMessagesDto {
  roomId: string;
  pagination: PaginationDto;
}
