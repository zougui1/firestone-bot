import { Effect } from 'effect';

import { tryFindGameWindow } from './findGameWindow'

export const getIsGameRunning = () => {
  return Effect.orElse(
    tryFindGameWindow().pipe(Effect.flatMap(() => Effect.succeed(true))),
    () => Effect.succeed(false),
  );
}
