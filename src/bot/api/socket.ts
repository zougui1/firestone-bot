import WebSocket from 'ws';
import { Effect, pipe } from 'effect';
import { type DurationInput } from 'effect/Duration';
import { z } from 'zod';

import { game } from '../store';
import { env } from '../../env';
import { catchError } from '../../utils';

const socket = new WebSocket(env.firestone.socket.uri, {
  rejectUnauthorized: false,
});

socket.on('error', error => {
  console.error('WebSocket error:', error);
});
socket.on('message', message => {
  console.log('message:', message.toString('utf-8'));
});

const stringifyRequest = (request: InternalFirestoneRequestData) => {
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

export const sendRequest = (request: FirestoneRequestData, options?: FirestoneRequestOptions) => {
  return pipe(
    game.getSession(),
    Effect.map(session => stringifyRequest({ ...request, ...session })),
    Effect.tap(() => Effect.tryPromise({
      try: ensureConnection,
      catch: cause => new Error('Could not connect to the websocket server', { cause }),
    })),
    Effect.tap(payload => Effect.logDebug(`Sending request: ${payload}`)),
    Effect.tap(payload => socket.send(Buffer.from(payload, 'utf-8'))),
    Effect.tap(() => {
      const sleep = options?.sleep ?? '1.5 second';

      if (sleep) {
        return Effect.sleep(sleep);
      }
    }),
    Effect.flatMap(() => Effect.void),
  );
}

const genericResponseSchema = z.object({
  Data: z.array(z.unknown()),
  Function: z.string(),
  SubFunction: z.string().optional(),
});

export class TimeoutError extends AggregateError {
  readonly _tag = 'TimeoutError';
}

export const waitResponse = <T extends z.ZodSchema>(
  specificResponseSchema: z.ZodObject<{ Function: z.ZodLiteral<string>; SubFunction?: z.ZodLiteral<string>; }>,
  schema: T,
) => {
  return Effect.async<z.infer<T>, TimeoutError | Error>(resume => {
    const errors: Error[] = [];

    const timeout = setTimeout(() => {
      cleanup();

      if (errors.length) {
        resume(Effect.fail(new TimeoutError(errors, `Response timed out with ${errors.length} error${errors.length === 1 ? '' : 's'}`)));
      } else {
        resume(Effect.fail(new TimeoutError([], 'Response timed out')));
      }
    }, 5_000);

    const cleanup = () => {
      clearTimeout(timeout);
      socket.off('message', onMessage);
      socket.off('error', onError);
    }

    const onMessage = (message: WebSocket.RawData) => {
      const payload = message.toString('utf-8');
      const [jsonError, json] = catchError(() => JSON.parse(payload));

      if (jsonError) {
        return errors.push(Error('Could not parse JSON response', { cause: jsonError }));
      }

      const genericResponseResult = genericResponseSchema.safeParse(json);

      if (!genericResponseResult.success) {
        return errors.push(Error('Invalid response', { cause: genericResponseResult.error }));
      }

      if (genericResponseResult.data.Function === 'UserOnMultipleInstances') {
        cleanup();
        return resume(Effect.die(new Error(`The user is running another instance of the game`)));
      }

      const specificResponseResult = specificResponseSchema.safeParse(genericResponseResult.data);

      if (!specificResponseResult.success) {
        return errors.push(Error('Invalid response type', { cause: specificResponseResult.error }));
      }

      const dataResult = schema.safeParse(genericResponseResult.data.Data);

      if (!dataResult.success) {
        cleanup();
        return resume(Effect.fail(Error('Invalid data in response', { cause: dataResult.error })));
      }

      cleanup();
      resume(Effect.succeed(dataResult.data));
    }

    const onError = (error: Error) => {
      cleanup();
      resume(Effect.die(Error('WebSocket error: Could not get a response', { cause: error })));
    }

    socket.on('message', onMessage);
    socket.on('error', onError);
  });
}

export const request = <T extends z.ZodSchema>(request: FirestoneRequest<T>) => {
  return pipe(
    sendRequest(request, { sleep: 0 }),
    Effect.tap(() => Effect.logDebug('Waiting for response...')),
    Effect.flatMap(() => waitResponse(request.responseSchema, request.dataSchema)),
    Effect.tap(() => Effect.sleep('1.5 second')),
  );
}

export interface FirestoneRequest<T extends z.ZodSchema> extends FirestoneRequestData {
  responseSchema: z.ZodObject<{ Function: z.ZodLiteral<string>; SubFunction?: z.ZodLiteral<string>; }>;
  dataSchema: T;
}

export interface FirestoneRequestData {
  type: string;
  parameters?: (string | number)[];
}

export interface FirestoneRequestOptions {
  sleep?: DurationInput;
}

export interface InternalFirestoneRequestData extends FirestoneRequestData {
  type: string;
  userId: string;
  sessionId: string;
  parameters?: (string | number)[];
  serverName: string;
}
