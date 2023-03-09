import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  snakeToCamelCase,
  transformObjectPropertiesCase,
} from '../../common/transformations/case.utils';
import DatabaseErrorCode from '../database/database.errors';
import DatabaseService from '../database/database.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create({ userId, username }: CreateRoomDto): Promise<Room> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
        INSERT INTO rooms (user_id, username)
        VALUES ($1, $2)
        RETURNING *
      `,
        [userId, username],
      );

      const createdRoomCamelCase = transformObjectPropertiesCase(
        databaseResponse.rows[0],
        snakeToCamelCase,
      );

      return plainToInstance(Room, createdRoomCamelCase);
    } catch (error) {
      if (error?.code === DatabaseErrorCode.UniqueViolation)
        throw new ConflictException(
          'Room assigned to this user already exists',
        );

      throw error;
    }
  }

  async findById(id: string): Promise<Room> {
    const databaseResponse = await this.databaseService.runQuery(
      `
        SELECT id, user_id as "userId", username, created_at as "createdAt"
        FROM rooms
        WHERE id = $1
      `,
      [id],
    );

    if (databaseResponse.rowCount === 0)
      throw new NotFoundException('Room not found');

    return plainToInstance(Room, databaseResponse?.rows[0]);
  }

  async getById(id: string): Promise<Room> {
    const databaseResponse = await this.databaseService.runQuery(
      `
        SELECT id, user_id as "userId", username, created_at as "createdAt"
        FROM rooms
        WHERE id = $1
      `,
      [id],
    );

    return plainToInstance(Room, databaseResponse?.rows[0]);
  }
}
