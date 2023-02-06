import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WsResponse,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { config } from 'dotenv';
import { AuthService } from '../auth/auth.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

config();

@WebSocketGateway(parseInt(process.env.WS_PORT), {
  transports: ['websocket'],
  cors: { origin: process.env.CORS_ORIGIN, credentials: true },
})
export class EventsGateway implements OnGatewayConnection {
  /**
   * @ignore
   */
  constructor(private readonly authService: AuthService) {}

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
      return client._error('Unauthenticated');
    }

    client.join(roomId);
  }

  /**
   * This method emits a user message to the rest room members
   * @param client Socket client
   * @returns A object with event type and status
   */
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('room-message')
  handleRoomMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): WsResponse<any> {
    const roomId = client.handshake.query?.roomId;

    client.to(roomId).emit('room-message', data);

    return { event: 'room-message', data: { status: 'ok' } };
  }
}
