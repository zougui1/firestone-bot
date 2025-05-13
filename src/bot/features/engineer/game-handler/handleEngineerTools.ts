import { Effect, pipe } from 'effect';

import * as api from '../../../api';
import { EventQueue } from '../../../eventQueue';
import { env } from '../../../../env';

export const handleEngineerTools = () => {
  return Effect.gen(function* () {
    const eventQueue = yield* EventQueue;
    yield* Effect.log('Claiming tools');

    const { claimed } = yield* api.engineer.claimTools().pipe(
      Effect.as({ claimed: true }),
      Effect.catchTag('TimeoutError', () => pipe(
        Effect.logError('Request to claim tools timed out'),
        Effect.as({ claimed: false }),
      )),
    );

    const timeoutSeconds = claimed ? env.firestone.cycleDurationSeconds : env.firestone.blindTimeoutSeconds;
    yield* eventQueue.add({
      type: 'engineerTools',
      timeoutMs: timeoutSeconds * 1000,
    });
  }).pipe(
    Effect.withLogSpan('engineerTools'),
    Effect.withSpan('engineerTools'),
  );
}
