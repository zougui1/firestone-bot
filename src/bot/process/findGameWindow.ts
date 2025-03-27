import { Effect, pipe } from 'effect';
import { isNumber } from 'radash';

export const findGameWindow = () => {
  return pipe(
    Effect.tryPromise({
      try: () => import('execa'),
      catch: cause => new Error('Could not import execa', { cause }),
    }),
    Effect.flatMap(({ execa }) => Effect.tryPromise({
      try: async (signal) => {
        const subProcess = execa('bash', [
          '-c',
          'wmctrl -G -l | grep -E "^([^ ]+ +)+Firestone$"',
        ]);
        const kill = () => subProcess.kill();

        signal.addEventListener('abort', kill);

        try {
          return await subProcess;
        } finally {
          signal.removeEventListener('abort', kill);
        }
      },
      catch: cause => new Error('Could not find the game\'s window metadata', { cause }),
    })),
    Effect.flatMap(result => {
      const [left, top, width, height] = result.stdout.split(/ +/).slice(2, 6).map(Number);

      if (!isNumber(left) || !isNumber(top) || !isNumber(width) || !isNumber(height)) {
        return Effect.fail(new Error('Invalid window geometry'));
      }

      return Effect.succeed({
        left,
        top,
        width,
        height,
      });
    }),
  );
}
