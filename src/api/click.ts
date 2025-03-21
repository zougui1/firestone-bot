import axios from 'axios';

import { store } from '../store';
import { clamp } from '../utils';

export const click = async (options: ClickOptions) => {
  const { window } = store.getSnapshot().context;
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

  await axios.get('http://127.0.0.1:8000/click', {
    params: {
      left: Math.round(left),
      top: Math.round(top),
      interval: options.interval,
      button: options.button,
      debug: options.debug,
    },
  });
}

export interface ClickOptions {
  left: number | `${number}%`;
  top: number | `${number}%`;
  interval?: number;
  button?: 'left' | 'right';
  debug?: boolean;
}
