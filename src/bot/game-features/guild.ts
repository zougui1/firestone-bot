import { Effect, pipe } from 'effect';

import { sendRequest } from '../api';

const expeditionCount = 5;

export const handleGuildExpeditions = () => {
  return pipe(
    Effect.log('Claiming expedition'),
    Effect.tap(() => sendRequest({ type: 'ClaimExpedition' })),

    Effect.tap(() => Effect.loop(0, {
      while: index => index < expeditionCount,
      step: index => index + 1,
      body: index => pipe(
        Effect.log(`Starting expedition index: ${index}`),
        Effect.tap(() => sendRequest({
          type: 'StartExpedition',
          parameters: [`GUEXP00${index}`],
        })),
      ),
      discard: true,
    })),
  );
}
