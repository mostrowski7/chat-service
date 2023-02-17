import { Socket } from 'socket.io';
import { Payload } from '../auth/auth.interface';

export type SocketWithTokenPayload = Socket & { payload: Payload };
