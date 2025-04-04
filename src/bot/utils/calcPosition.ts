import { navigation } from '../store';

export const calcPosition = (position: `${number}%`, property: 'width' | 'height') => {
  const { window } = navigation.store.getSnapshot().context;
  return Number(position.slice(0, -1)) / 100 * window[property];
}
