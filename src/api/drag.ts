import axios from 'axios';
import { sleep } from 'radash';

import { store } from '../store';
import { clamp } from '../utils';

export const drag = async (options: DragOptions) => {
  const { window } = store.getSnapshot().context;
  const flags: string[] = [];

  const startPosition = {
    left: options.left ?? options.x ?? 1,
    top: options.top ?? options.y ?? 1,
  };

  if (options.duration) {
    flags.push(`--duration=${options.duration}`);
  }

  if (options.debug) {
    flags.push('--debug');
  }

  const startLeftPixels = typeof startPosition.left === 'string'
    ? Number(startPosition.left.slice(0, -1)) / 100 * window.width
    : startPosition.left;
  const startTopPixels = typeof startPosition.top === 'string'
    ? Number(startPosition.top.slice(0, -1)) / 100 * window.height
    : startPosition.top;

  const endLeftPixels = options.left ? startLeftPixels * -1 : startLeftPixels;
  const endTopPixels = options.top ? startTopPixels * -1 : startTopPixels;

  const startLeft = clamp(window.left + startLeftPixels, window.left + 1, window.left + window.width - 1);
  const startTop = clamp(window.top + startTopPixels, window.top + 1, window.top + window.width - 1);
  const endLeft = clamp(window.left + endLeftPixels, window.left + 1, window.left + window.width - 1);
  const endTop = clamp(window.top + endTopPixels, window.top + 1, window.top + window.width - 1);

  await axios.get('http://127.0.0.1:8000/drag', {
    params: {
      startLeft: Math.round(startLeft),
      startTop: Math.round(startTop),
      endLeft: Math.round(endLeft),
      endTop: Math.round(endTop),
      duration: options.duration,
      debug: options.debug,
    },
  });

  await sleep(5000);
}

export interface DragOptions {
  left?: number | `${number}%`;
  top?: number | `${number}%`;
  x?: number | `${number}%`;
  y?: number | `${number}%`;
  duration?: number;
  debug?: boolean;
}
