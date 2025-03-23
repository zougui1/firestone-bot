import { Console, Effect, pipe } from 'effect';
import { getIsGameRunning } from './getIsGameRunning';
import { startGame } from './startGame';

export const ensureGameRunning = () => {
  return pipe(
    Console.log('ensuring game is running'),
    Effect.flatMap(() => Effect.if(getIsGameRunning(), {
      onTrue: () => Console.log('game is already running'),
      onFalse: () => pipe(
        Console.log('starting game'),
        Effect.flatMap(startGame),
      ),
    })),
  );
}
