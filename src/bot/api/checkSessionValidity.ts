import { Effect } from 'effect';

import { startBattle } from './campaign';

export const checkSessionValidity = () => {
  return startBattle({ mission: 0, difficulty: 0 }).pipe(
    Effect.mapBoth({
      onSuccess: () => true,
      onFailure: () => false,
    }),
  );
}
