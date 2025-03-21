import { Server, type Socket } from 'socket.io';
import Emittery from 'emittery';

export class ServerSocket extends Emittery<ServerSocketEventMap> {
  readonly io = new Server();
  #sockets = new Set<Socket>();
  #connectionChanged = false;

  get connectedClients(): number {
    return this.#sockets.size;
  }

  constructor(options: ServerSocketOptions) {
    super();

    this.io.listen(options.port);

    this.io.on('connection', socket => {
      this.#connectionChanged = true;
      this.#sockets.add(socket);
      this._emitConnectionChange();

      socket.on('disconnect', () => {
        this.#sockets.delete(socket);
        this._emitConnectionChange();
      });
    });

    // wait 2 seconds before emitting a fake connection change
    // for the initial initialization, only if it hasn't been emitted yet
    setTimeout(() => {
      if (!this.#connectionChanged) {
        this._emitConnectionChange();
      }
    }, 2000);
  }

  private _emitConnectionChange = (): void => {
    this.emit('connectionChange', {
      connectedClients: this.#sockets.size,
    });
  }
}

export interface ServerSocketOptions {
  port: number;
}

export interface ServerSocketEventMap {
  connectionChange: { connectedClients: number };
}
