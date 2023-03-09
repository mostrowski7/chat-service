import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { MessagesModule } from '../messages/messages.module';
import { RoomsModule } from '../rooms/rooms.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [ConfigModule, AuthModule, MessagesModule, RoomsModule],
  providers: [EventsGateway],
})
export class EventsModule {}
