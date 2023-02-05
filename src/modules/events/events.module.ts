import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [EventsGateway],
})
export class EventsModule {}
