import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Module({
  imports: [ConfigModule, JwtModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
