import { Effect, pipe } from 'effect';

import * as api from '../../../api';
import * as eventQueue from '../../../eventQueue';

export const handlePickaxeSupplies = () => {
  return pipe(
    Effect.log('Claiming free pickaxes'),
    Effect.tap(() => api.sendRequest({ type: 'ClaimFreePickaxes' })),
    Effect.tap(() => eventQueue.add({
      type: 'pickaxesClaiming',
      timeoutMs: 2 * 60 * 60 * 1000,
    })),
  ).pipe(
    Effect.withLogSpan('freePickaxes'),
    Effect.withSpan('freePickaxes'),
  );
}
