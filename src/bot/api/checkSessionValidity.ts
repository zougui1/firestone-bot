import { Effect } from 'effect';

import { startBattle } from './campaign';

export const checkSessionValidity = () => {
  return startBattle({ mission: 0, difficulty: 0 }).pipe(
    Effect.as(true),
    Effect.catchTags({
      ResponseError: () => Effect.succeed(true),
      TimeoutError: () => Effect.succeed(false),
    }),
  );
}
