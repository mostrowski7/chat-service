import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  snakeToCamelCase,
  transformObjectPropertiesCase,
} from '../../common/transformations/case.utils';
import DatabaseErrorCode from '../database/database.errors';
import DatabaseService from '../database/database.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create({
    roomId,
    userId,
    username,
    text,
  }: CreateMessageDto): Promise<Message> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
            INSERT INTO messages (room_id, user_id, username, text)
            VALUES ($1, $2, $3, $4)
        `,
        [roomId, userId, username, text],
      );

      const createdMessageCamelCase = transformObjectPropertiesCase(
        databaseResponse.rows[0],
        snakeToCamelCase,
      );

      return plainToInstance(Message, createdMessageCamelCase);
    } catch (e) {
      if (e?.code === DatabaseErrorCode.ForeignKeyViolation)
        throw new NotFoundException('Room not found');

      throw e;
    }
  }

  async getMessagesByRoomId({
    roomId,
    pagination: { page, itemsPerPage },
  }: GetMessagesDto): Promise<Message[]> {
    const offset = page * itemsPerPage - itemsPerPage;
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        SELECT messages.username, messages.text
        FROM messages
        LEFT JOIN rooms ON rooms.id = messages.room_id
        WHERE rooms.id = $1
        LIMIT $2
        OFFSET $3
      `,
        [roomId, itemsPerPage, offset],
      );

      return databaseResponse.rows;
    } catch (e) {
      if (e?.code === DatabaseErrorCode.ForeignKeyViolation)
        throw new NotFoundException('Room not found');

      throw e;
    }
  }
}
