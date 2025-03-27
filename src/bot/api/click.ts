import axios from 'axios';
import { Effect, pipe } from 'effect';

import { navigation } from '../store';
import { clamp } from '../utils';
import { env } from '../../env';

export const click = (options: ClickOptions) => {
  const { window } = navigation.store.getSnapshot().context;
  const flags: string[] = [];

  if (options.interval) {
    flags.push(`--interval=${options.interval}`);
  }

  if (options.button) {
    flags.push(`--button=${options.button}`);
  }

  if (options.debug) {
    flags.push('--debug');
  }

  const leftPixels = typeof options.left === 'string'
    ? Number(options.left.slice(0, -1)) / 100 * window.width
    : options.left;
  const topPixels = typeof options.top === 'string'
    ? Number(options.top.slice(0, -1)) / 100 * window.height
    : options.top;

  const left = clamp(window.left + leftPixels, window.left + 1, window.left + window.width - 1);
  const top = clamp(window.top + topPixels, window.top + 1, window.top + window.height - 1);

  return pipe(
    Effect.tryPromise({
      try: () => axios.get('http://127.0.0.1:8000/click', {
        params: {
          left: Math.round(left),
          top: Math.round(top),
          interval: options.interval,
          button: options.button,
          debug: options.debug,
        },
      }),
      catch: error => new Error('Could not simulate click', { cause: error }),
    }),
    Effect.flatMap(() => Effect.sleep(`${env.postUiInteractionWaitTime} seconds`)),
  );
}

export interface ClickOptions {
  left: number | `${number}%`;
  top: number | `${number}%`;
  interval?: number;
  button?: 'left' | 'right';
  debug?: boolean;
}
