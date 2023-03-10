import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { Room } from './entities/room.entity';
import { RoomsRepository } from './rooms.repository';

@Injectable()
export class RoomsService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async create(createRoomData: CreateRoomDto): Promise<Room> {
    return await this.roomsRepository.create(createRoomData);
  }

  async findById(id: string): Promise<Room> {
    return await this.roomsRepository.findById(id);
  }

  async getById(id: string): Promise<Room> {
    return await this.roomsRepository.getById(id);
  }
}
