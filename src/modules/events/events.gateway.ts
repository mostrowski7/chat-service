import { WebSocketGateway } from '@nestjs/websockets';
import { OnGatewayConnection } from '@nestjs/websockets/interfaces';
import { Socket } from 'socket.io';
import { config } from 'dotenv';
import { AuthService } from '../auth/auth.service';

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
}
