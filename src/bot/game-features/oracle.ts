import { Effect, pipe } from 'effect';

import { sendRequest } from '../api';

const rituals = [
  'obedience',
  'serenity',
  'concentration',
  'harmony',
];

export const handleOracleRituals = () => {
  return pipe(
    Effect.log('Claiming ritual'),
    Effect.tap(() => sendRequest({ type: 'ClaimRitual' })),

    Effect.tap(() => Effect.loop(0, {
      while: index => index < rituals.length,
      step: index => index + 1,
      body: index => pipe(
        Effect.log(`Starting ritual ${rituals[index]}`),
        Effect.tap(() => sendRequest({
          type: 'StartRitual',
          parameters: [index],
        })),
      ),
      discard: true,
    })),
  );
}
