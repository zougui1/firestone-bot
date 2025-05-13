import { Effect } from 'effect';

import * as api from '../../../api';
import { EventQueue } from '../../../eventQueue';

export const handlePickaxeSupplies = () => {
  return Effect.gen(function* () {
    const eventQueue = yield* EventQueue;
    yield* Effect.log('Claiming free pickaxes');
    yield* api.sendRequest({ type: 'ClaimFreePickaxes' });

    yield* eventQueue.add({
      type: 'pickaxesClaiming',
      timeoutMs: 2 * 60 * 60 * 1000,
    });
  }).pipe(
    Effect.withLogSpan('freePickaxes'),
    Effect.withSpan('freePickaxes'),
  );
}
