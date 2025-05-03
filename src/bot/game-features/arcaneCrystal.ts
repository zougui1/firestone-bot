import { Effect, pipe } from 'effect';

import { sendRequest } from '../api';

//! missing claim

export const handlePickaxeSupplies = () => {
  return pipe(
    Effect.log('Claiming free pickaxes'),
    Effect.tap(() => sendRequest({ type: 'ClaimFreePickaxes' })),
  );
}
