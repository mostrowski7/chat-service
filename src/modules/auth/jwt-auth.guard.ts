import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io/dist/socket';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const accessToken = client.handshake.auth?.accessToken;

    if (!this.authService.verifyAccessToken(accessToken)) {
      return false;
    }

    return true;
  }
}
