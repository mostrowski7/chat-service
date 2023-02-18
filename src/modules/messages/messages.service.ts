import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { Message } from './entities/message.entity';
import { MessagesRepository } from './messages.repository';

@Injectable()
export class MessagesService {
  constructor(private readonly messagesRepository: MessagesRepository) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    return await this.messagesRepository.create(createMessageDto);
  }

  async getMessagesByRoomId(getMessagesDto: GetMessagesDto) {
    return this.messagesRepository.getMessagesByRoomId(getMessagesDto);
  }
}
