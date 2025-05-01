import WebSocket from 'ws';
import { Effect, pipe } from 'effect';

import { env } from '../../env';
import { game } from '../store';

const socket = new WebSocket(env.firestone.socket.uri);

const stringifyRequest = (request: InternalFirestoneRequest) => {
  const firstPart = [
    request.type,
    request.userId,
    request.sessionId,
    ...(request.parameters ?? []),
  ].join('|==|');

  const wholeRequest = [
    firstPart,
    request.serverName,
    829,
  ].join('|-+-|');

  return wholeRequest;
}

const ensureConnection = async () => {
  if (socket.readyState !== socket.CONNECTING) {
    return;
  }

  const { promise, resolve, reject } = Promise.withResolvers();

  socket.on('open', resolve);
  socket.on('error', reject);

  try {
    await promise
  } finally {
    socket.off('open', resolve);
    socket.off('error', reject);
  }
}

export const sendRequest = (request: FirestoneRequest) => {
  return pipe(
    game.getSession(),
    Effect.map(session => stringifyRequest({ ...request, ...session })),
    Effect.tap(() => Effect.tryPromise({
      try: ensureConnection,
      catch: cause => new Error('Could not connect to the websocket server', { cause }),
    })),
    Effect.tap(payload => Effect.logDebug(`Sending request: ${payload}`)),
    Effect.tap(payload => socket.send(Buffer.from(payload, 'utf-8'))),
    Effect.flatMap(() => Effect.void),
  );
}

export interface FirestoneRequest {
  type: string;
  parameters?: (string | number)[];
}

export interface InternalFirestoneRequest extends FirestoneRequest {
  type: string;
  userId: string;
  sessionId: string;
  parameters?: (string | number)[];
  serverName: string;
}
