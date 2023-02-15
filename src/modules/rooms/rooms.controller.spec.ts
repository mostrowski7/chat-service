import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import DatabaseService from '../database/database.service';
import DatabaseErrorCode from '../database/database.errors';
import { JwtStrategy } from '../auth/jwt.strategy';
import { RoomsService } from './rooms.service';
import { RoomsRepository } from './rooms.repository';
import { RoomsController } from './rooms.controller';

describe('RoomsController', () => {
  const runQueryMock = jest.fn();
  const uuidRegex =
    /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;
  const payload = {
    userId: '2062cd7c-95aa-4c75-a3f0-6c7ef8750d96',
    username: 'username',
    email: 'user@gmail.com',
  };
  let app: INestApplication, accessToken: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
          secretOrPrivateKey: 'secret',
        }),
      ],
      controllers: [RoomsController],
      providers: [
        JwtStrategy,
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

    app = module.createNestApplication();
    await app.init();

    const jwtService = module.get<JwtService>(JwtService);
    accessToken = jwtService.sign(payload);
  });

  describe('POST /rooms', () => {
    beforeEach(() => {
      runQueryMock.mockResolvedValue({
        rows: [
          {
            id: 'd2771ffe-8834-4c16-ba1b-9097e5a9f1d2',
            user_id: payload.userId,
            username: payload.username,
            created_at: Date.now(),
          },
        ],
      });
    });

    describe('when successfully create room', () => {
      it('should return status 201', async () => {
        const response = await request(app.getHttpServer())
          .post('/rooms')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(201);
      });

      it('should return created room object', async () => {
        const response = await request(app.getHttpServer())
          .post('/rooms')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.body).toMatchObject({
          id: expect.stringMatching(uuidRegex),
          userId: payload.userId,
          username: payload.username,
          createdAt: expect.any(Number),
        });
      });
    });

    describe('when room already exists', () => {
      it('should return status 409', async () => {
        runQueryMock.mockRejectedValue({
          code: DatabaseErrorCode.UniqueViolation,
        });

        const response = await request(app.getHttpServer())
          .post('/rooms')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(409);
      });
    });

    describe('when access token is invalid', () => {
      it('should return status 401', async () => {
        const response = await request(app.getHttpServer())
          .post('/rooms')
          .set('Authorization', 'Bearer invalid');

        expect(response.statusCode).toBe(401);
      });
    });
  });
});
