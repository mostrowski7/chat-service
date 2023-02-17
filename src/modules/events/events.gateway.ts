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
  ) {}

  /**
   * This method handles user connection to WebSocket server
   * - it checks access and adds client to room
   * @param client Socket client
   */
  handleConnection(client: Socket) {
    const accessToken = client.handshake.auth?.accessToken;
    const roomId = client.handshake.query?.roomId;

    const payload = this.authService.verifyAccessToken(accessToken);

    if (!payload) {
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
    @MessageBody() data: { message: string; roomId: string },
    @ConnectedSocket() client: SocketWithTokenPayload,
  ) {
    const { message, roomId } = data;
    const { sub, username } = client.payload;
    client.to(roomId).emit('room-message', message);

    await this.messagesService.create({
      roomId,
      userId: sub,
      username,
      text: message,
    });
  }
}
