import axios from 'axios';
import { Effect, pipe } from 'effect';

export const press = (options: PressOptions) => {
  return pipe(
    Effect.tryPromise({
      try: () => axios.get('http://127.0.0.1:8000/press', {
        params: { key: options.key },
      }),
      catch: error => new Error('Could not simulate click', { cause: error }),
    }),
    Effect.flatMap(() => Effect.sleep('5 seconds')),
  );
}

export interface PressOptions {
  key: string;
}
