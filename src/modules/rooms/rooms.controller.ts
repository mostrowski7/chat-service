import { Controller, Post, Get, Req, Query, Param } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from '../messages/messages.service';
import { GetMessagesParamsDto } from './dto/get-messages-params.dto';
import { RequestWithUser } from './rooms.interface';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly messagesService: MessagesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: RequestWithUser) {
    const { userId, username } = req.user;
    return this.roomsService.create({ userId, username });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  async getMessagesByRoomId(
    @Param() params: GetMessagesParamsDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.messagesService.getMessagesByRoomId({
      roomId: params.id,
      pagination,
    });
  }
}
