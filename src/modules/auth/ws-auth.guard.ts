import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SocketWithTokenPayload } from '../events/events.type';
import { AuthService } from './auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<SocketWithTokenPayload>();
    const accessToken = client.handshake.auth?.accessToken;

    const payload = this.authService.verifyAccessToken(accessToken);

    if (!payload) return false;

    client.payload = payload;

    return true;
  }
}
