import { store } from '../store';

export const calcPosition = (position: `${number}%`, property: 'width' | 'height'): number => {
  const { window } = store.getSnapshot().context;
  return Number(position.slice(0, -1)) / 100 * window[property];
}
