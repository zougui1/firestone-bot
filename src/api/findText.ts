import axios from 'axios';
import { z } from 'zod';

import { navigation } from '../store';
import { clamp } from '../utils';
import { Effect, pipe } from 'effect';

const textSchema = z.object({
  content: z.string(),
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
});

const resultSchema = z.object({
  texts: z.array(textSchema),
});

export const findText = (options: FindTextOptions) => {
  const { window } = navigation.store.getSnapshot().context;

  const leftPixels = typeof options.left === 'string'
    ? Number(options.left.slice(0, -1)) / 100 * window.width
    : options.left ?? 0;
  const topPixels = typeof options.top === 'string'
    ? Number(options.top.slice(0, -1)) / 100 * window.height
    : options.top ?? 0;
  const widthPixels = typeof options.width === 'string'
    ? Number(options.width.slice(0, -1)) / 100 * window.width
    : options.width ?? window.width;
  const heightPixels = typeof options.height === 'string'
    ? Number(options.height.slice(0, -1)) / 100 * window.height
    : options.height ?? window.height;

  const left = clamp(window.left + leftPixels, window.left + 1, window.left + window.width - 1);
  const top = clamp(window.top + topPixels, window.top + 1, window.top + window.height - 1);
  const width = clamp(widthPixels, 0, window.width - 2);
  const height = clamp(heightPixels, 0, window.height - 2);

  return pipe(
    Effect.tryPromise({
      try: () => axios.get('http://127.0.0.1:8000/find-text', {
        params: {
          left: Math.round(left),
          top: Math.round(top),
          width: Math.round(width),
          height: Math.round(height),
          debug: options.debug,
        },
      }),
      catch: error => new Error('Could not find text', { cause: error }),
    }),
    Effect.tap(() => Effect.sleep('5 seconds')),
    Effect.map(response => resultSchema.safeParse(response.data)),
    Effect.map(result => result.success ? result.data.texts : [])
  );
}

export interface FindTextOptions {
  left?: number | `${number}%`;
  top?: number | `${number}%`;
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  debug?: boolean;
}
