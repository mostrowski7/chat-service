import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io-client/build/esm/socket';
import * as io from 'socket.io-client';
import DatabaseService from '../database/database.service';
import { EventsGateway } from './events.gateway';
import { AuthService } from '../auth/auth.service';
import { MessagesService } from '../messages/messages.service';
import { runQueryMock } from '../database/database.mock';
import { MessagesRepository } from '../messages/messages.repository';

describe('EventsGateway', () => {
  const messageRow = {
    id: '3062cd7c-95aa-4c75-a3f0-6c7ef8750d9c',
    userId: '2062cd7c-95aa-4c75-a3f0-6c7ef8750d96',
    roomId: 'd2771ffe-8834-4c16-ba1b-9097e5a9f1d2',
    text: 'message',
    username: 'username',
    createdAt: Date.now(),
  };
  const payload = {
    userId: '2062cd7c-95aa-4c75-a3f0-6c7ef8750d96',
    username: 'username',
    email: 'user@gmail.com',
  };
  const roomId = 'e2771ffe-8834-4c16-ba1b-9097e5a9f1d2';
  let app: INestApplication,
    accessToken: string,
    connectToWsGateway: () => Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
          secretOrPrivateKey: 'secret',
        }),
      ],
      providers: [
        EventsGateway,
        AuthService,
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

    app = module.createNestApplication();
    await app.init();

    const jwtService = module.get<JwtService>(JwtService);
    accessToken = jwtService.sign(payload);

    connectToWsGateway = () =>
      io.connect(`ws://localhost:${process.env.WS_PORT}`, {
        transports: ['websocket'],
        forceNew: true,
        withCredentials: true,
        query: { roomId },
        auth: {
          accessToken,
        },
      });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should connect and disconnect', (done) => {
    const socket = connectToWsGateway();

    socket.on('connect', () => {
      socket.disconnect();
    });

    socket.on('disconnect', (reason) => {
      expect(reason).toBe('io client disconnect');
      done();
    });
  });

  it('should emit room message and room member receives this message', (done) => {
    runQueryMock.mockResolvedValue({
      rows: [messageRow],
    });

    const socket1 = connectToWsGateway();
    const socket2 = connectToWsGateway();

    socket1.on('connect', () => {
      socket1.emit('room-message', {
        message: 'message',
        roomId,
      });
    });

    socket2.on('connect', () => {
      socket2.on('room-message', (data) => {
        expect(data).toBe('message');

        socket1.disconnect();
        socket2.disconnect();
        done();
      });
    });
  });
});
