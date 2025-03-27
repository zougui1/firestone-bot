import { Effect, pipe } from 'effect';

export const startGame = () => {
  return pipe(
    Effect.log('Starting game'),
    Effect.flatMap(() => Effect.orDie(Effect.tryPromise({
      try: () => import('execa'),
      catch: cause => new Error('Could not import execa', { cause }),
    }))),
    Effect.flatMap(({ execa }) => Effect.orDie(Effect.tryPromise({
      try: async (signal) => {
        const subProcess = execa('steam', ['steam://rungameid/1013320']);
        const kill = () => subProcess.kill();

        signal.addEventListener('abort', kill);

        try {
          await subProcess;
        } finally {
          signal.removeEventListener('abort', kill);
        }
      },
      catch: cause => new Error('Could not start the game', { cause }),
    }))),
    // wait until the game has started
    Effect.tap(() => Effect.sleep('10 seconds')),
  );
}
