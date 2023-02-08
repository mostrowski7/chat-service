import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Payload } from './auth.interface';

@Injectable()
export class AuthService {
  /**
   * @ignore
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * This method checks if user access token is valid
   * @param token User access token
   * @returns Token payload or null
   */
  verifyAccessToken(token: string): Payload {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (e) {
      return null;
    }
  }
}
