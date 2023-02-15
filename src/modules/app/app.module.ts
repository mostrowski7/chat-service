import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Environment, validate } from '../../config/env.validation';
import DatabaseModule from '../database/database.module';
import { EventsModule } from '../events/events.module';
import { HealthModule } from '../health/health.module';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      validate,
    }),
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host:
          configService.get('NODE_ENV') === Environment.Test
            ? configService.get('POSTGRES_TEST_HOST')
            : configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        user: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
      }),
    }),
    HealthModule,
    EventsModule,
    RoomsModule,
  ],
})
export class AppModule {}
