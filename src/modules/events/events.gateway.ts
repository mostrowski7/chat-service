import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { config } from 'dotenv';
import { AuthService } from '../auth/auth.service';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import { SocketWithTokenPayload } from './events.type';
import { MessagesService } from '../messages/messages.service';
import { RoomsService } from '../rooms/rooms.service';

config();

@WebSocketGateway(parseInt(process.env.WS_PORT), {
  transports: ['websocket'],
  cors: { origin: process.env.CORS_ORIGIN, credentials: true },
})
export class EventsGateway implements OnGatewayConnection {
  /**
   * @ignore
   */
  constructor(
    private readonly authService: AuthService,
    private readonly messagesService: MessagesService,
    private readonly roomsService: RoomsService,
  ) {}

  /**
   * This method handles user connection to WebSocket server
   * - it checks access and adds client to room
   * @param client Socket client
   */
  async handleConnection(client: Socket) {
    const accessToken = client.handshake.auth?.accessToken;
    const roomId = client.handshake.query?.roomId as string;

    const payload = this.authService.verifyAccessToken(accessToken);

    const room = await this.roomsService.getById(roomId);

    if (!payload || !room) {
      return client.disconnect();
    }

    client.join(roomId);
  }

  /**
   * This method emits a user message to the rest room members
   * @param client Socket client
   * @returns A object with event type and status
   */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('room-message')
  async emitRoomMessage(
    @MessageBody() data: { message: string },
    @ConnectedSocket() client: SocketWithTokenPayload,
  ) {
    const { message } = data;
    const { sub, username } = client.payload;
    const roomId = [...client.rooms].pop();

    client.to(roomId).emit('room-message', { userId: sub, username, message });

    await this.messagesService.create({
      roomId,
      userId: sub,
      username,
      text: message,
    });
  }
}
