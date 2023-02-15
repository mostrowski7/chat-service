import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import DatabaseService from '../database/database.service';
import DatabaseErrorCode from '../database/database.errors';
import { RoomsRepository } from './rooms.repository';
import { RoomsService } from './rooms.service';
import { Room } from './entities/room.entity';

describe('RoomsService', () => {
  const createRoomDto = {
    userId: '2062cd7c-95aa-4c75-a3f0-6c7ef8750d96',
    username: 'username',
  };
  const uuidRegex =
    /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;
  const runQueryMock: jest.Mock = jest.fn();
  let roomsService: RoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        RoomsRepository,
        {
          provide: DatabaseService,
          useValue: {
            runQuery: runQueryMock,
          },
        },
      ],
    }).compile();

    roomsService = module.get<RoomsService>(RoomsService);
  });

  describe('create method', () => {
    describe('when successfully create room', () => {
      it('should return created room object', async () => {
        runQueryMock.mockResolvedValue({
          rows: [
            {
              id: 'd2771ffe-8834-4c16-ba1b-9097e5a9f1d2',
              user_id: createRoomDto.userId,
              username: createRoomDto.username,
              created_at: Date.now(),
            },
          ],
        });

        const result = await roomsService.create(createRoomDto);

        expect(result).toMatchObject<Room>({
          id: expect.stringMatching(uuidRegex),
          userId: createRoomDto.userId,
          username: createRoomDto.username,
          createdAt: expect.any(Number),
        });
      });
    });

    describe('when throws unique violation error', () => {
      it('should return conflict exception', async () => {
        runQueryMock.mockRejectedValue({
          code: DatabaseErrorCode.UniqueViolation,
        });

        await expect(roomsService.create(createRoomDto)).rejects.toThrowError(
          new ConflictException('Room assigned to this user already exists'),
        );
      });
    });
  });
});
