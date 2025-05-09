import { Effect, pipe } from 'effect';

import * as api from '../api';
import * as eventQueue from '../eventQueue';
import { env } from '../../env';

// claim
//* {"Function":"WarfrontReplies","SubFunction":"ClaimToolsReply","Data":[1746183456,750,false]}

export const handleEngineerTools = () => {
  return Effect.gen(function* () {
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
  });
}
