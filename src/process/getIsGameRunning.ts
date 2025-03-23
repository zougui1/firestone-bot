import { Effect } from 'effect';
import { findGameWindow } from './findGameWindow'

export const getIsGameRunning = () => {
  return Effect.orElse(
    findGameWindow().pipe(Effect.flatMap(() => Effect.succeed(true))),
    () => Effect.succeed(false),
  );
}
