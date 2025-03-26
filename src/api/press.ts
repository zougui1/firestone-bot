import axios from 'axios';
import { Effect, pipe } from 'effect';

import { env } from '../env';

export const press = (options: PressOptions) => {
  return pipe(
    Effect.tryPromise({
      try: () => axios.get('http://127.0.0.1:8000/press', {
        params: { key: options.key },
      }),
      catch: error => new Error('Could not simulate click', { cause: error }),
    }),
    Effect.flatMap(() => Effect.sleep(`${env.postUiInteractionWaitTime} seconds`)),
  );
}

export interface PressOptions {
  key: string;
}
