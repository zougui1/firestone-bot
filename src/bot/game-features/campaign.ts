import { Effect, pipe } from 'effect';

import * as api from '../api';
import * as eventQueue from '../eventQueue';
import { env } from '../../env';

//! missing claim

export const handleCampaignLoot = () => {
  return Effect.gen(function* () {
    yield* Effect.log('Claiming campaign loots');
    const { claimed } = yield* api.campaign.claimLoots().pipe(
      Effect.as({ claimed: true }),
      Effect.catchTag('TimeoutError', () => pipe(
        Effect.logError('Request to claim campaign loots timed out'),
        Effect.as({ claimed: false }),
      )),
    );

    const timeoutSeconds = claimed ? env.firestone.cycleDurationSeconds : env.firestone.blindTimeoutSeconds;
    yield* eventQueue.add({
      type: 'campaignLoot',
      timeoutMs: timeoutSeconds * 1000,
    });
  });
}
