import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import DatabaseErrorCode from '../database/database.errors';
import { runQueryMock } from '../database/database.mock';
import DatabaseService from '../database/database.service';
import { Message } from './entities/message.entity';
import { MessagesRepository } from './messages.repository';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  const createMessageDto = {
    userId: '2062cd7c-95aa-4c75-a3f0-6c7ef8750d96',
    roomId: 'd2771ffe-8834-4c16-ba1b-9097e5a9f1d2',
    text: 'message',
    username: 'username',
  };
  const roomId = createMessageDto.roomId;
  const messageRow = {
    id: '3062cd7c-95aa-4c75-a3f0-6c7ef8750d9c',
    createdAt: Date.now(),
    ...createMessageDto,
  };
  const uuidRegex =
    /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;
  let messagesService: MessagesService, pagination: PaginationDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        MessagesRepository,
        {
          provide: DatabaseService,
          useValue: {
            runQuery: runQueryMock,
          },
        },
      ],
    }).compile();

    messagesService = module.get(MessagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create method', () => {
    describe('when successfully create message', () => {
      it('should return created message object', async () => {
        runQueryMock.mockResolvedValue({
          rows: [messageRow],
        });

        const result = await messagesService.create(createMessageDto);

        expect(result).toMatchObject<Message>({
          id: expect.stringMatching(uuidRegex),
          roomId: createMessageDto.roomId,
          userId: createMessageDto.userId,
          username: createMessageDto.username,
          text: createMessageDto.text,
          createdAt: expect.any(Number),
        });
      });
    });

    describe('when throws foreign key violation', () => {
      it('should return not found exception', async () => {
        runQueryMock.mockRejectedValue({
          code: DatabaseErrorCode.ForeignKeyViolation,
        });

        await expect(messagesService.create(createMessageDto)).rejects.toThrow(
          new NotFoundException('Room not found'),
        );
      });
    });
  });

  describe('getMessagesByRoomId method', () => {
    beforeEach(() => {
      pagination = {
        page: 1,
        itemsPerPage: 1,
      };
    });
    describe('when room exists', () => {
      describe('and when not found messages', () => {
        it('should return empty array', async () => {
          runQueryMock.mockResolvedValue({
            rows: [],
          });

          const result = await messagesService.getMessagesByRoomId({
            roomId,
            pagination,
          });

          expect(result).toEqual([]);
        });
      });

      describe('and when found messages', () => {
        it('should return messages array', async () => {
          runQueryMock.mockResolvedValue({
            rows: [messageRow],
          });

          const result = await messagesService.getMessagesByRoomId({
            roomId,
            pagination,
          });

          expect(result).toEqual(expect.arrayContaining([messageRow]));
        });
      });
    });

    describe('when room not found', () => {
      it('should return not found exception', async () => {
        runQueryMock.mockRejectedValue({
          code: DatabaseErrorCode.ForeignKeyViolation,
        });

        await expect(
          messagesService.getMessagesByRoomId({
            roomId,
            pagination,
          }),
        ).rejects.toThrow(new NotFoundException('Room not found'));
      });
    });
  });
});
