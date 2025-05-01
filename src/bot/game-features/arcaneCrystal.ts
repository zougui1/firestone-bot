import { Effect, pipe } from 'effect';

import { sendRequest } from '../api';

export const handlePickaxeSupplies = () => {
  return pipe(
    Effect.log('Claiming free pickaxes'),
    Effect.tap(() => sendRequest({ type: 'ClaimFreePickaxes' })),
  );
}
