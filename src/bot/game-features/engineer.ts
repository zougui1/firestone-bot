import { Effect, pipe } from 'effect';

import { sendRequest } from '../api';

export const handleEngineerTools = () => {
  return pipe(
    Effect.log('Claiming tools'),
    Effect.tap(() => sendRequest({ type: 'ClaimTools' })),
  );
}
