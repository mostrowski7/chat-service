import { WebSocketGateway } from '@nestjs/websockets';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets/interfaces';
import { Socket } from 'socket.io';

@WebSocketGateway(parseInt(process.env.WS_PORT), {
  transports: ['websocket'],
  cors: { origin: process.env.CORS_ORIGIN, credentials: true },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(socket: Socket) {}

  handleDisconnect(socket: Socket) {}
}
