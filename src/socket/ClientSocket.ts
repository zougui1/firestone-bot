import { io, type Socket } from 'socket.io-client';

export class ClientSocket {
  readonly socket: Socket;

  constructor(options: ClientSocketOptions) {
    this.socket = io(`${options.domain}:${options.port}`);
  }

  waitStatus = async (): Promise<{ isRunning: boolean }> => {
    return new Promise(resolve => {
      const handleConnect = () => {
        cleanup();
        resolve({ isRunning: true });
      }

      const handleDisconnect = () => {
        cleanup();
        resolve({ isRunning: false });
      }

      const cleanup = () => {
        this.socket.off('connect', handleConnect);
        this.socket.off('connect_error', handleDisconnect);
        this.socket.off('disconnect', handleDisconnect);
      }

      this.socket.once('connect', handleConnect);
      this.socket.once('connect_error', handleDisconnect);
      this.socket.once('disconnect', handleDisconnect);
    });
  }
}

export interface ClientSocketOptions {
  domain: string;
  port: number;
}
