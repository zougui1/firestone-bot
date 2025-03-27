import { Effect, pipe } from 'effect';

import { getIsGameRunning } from './getIsGameRunning';
import { startGame } from './startGame';

export const ensureGameRunning = () => {
  return pipe(
    Effect.log('Ensuring game is running'),
    Effect.tap(() => Effect.if(getIsGameRunning(), {
      onTrue: () => Effect.log('Game is already running'),
      onFalse: startGame,
    })),
  );
}
