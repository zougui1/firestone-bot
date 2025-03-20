import { isNumber } from 'radash';

export const findGameWindow = async () => {
  const { execa } = await import('execa');
  const geometryResult = await execa('bash', [
    '-c',
    'wmctrl -G -l | grep -E "^([^ ]+ +)+Firestone$"',
  ]);

  const [left, top, width, height] = geometryResult.stdout.split(/ +/).slice(2, 6).map(Number);

  if (!isNumber(left) || !isNumber(top) || !isNumber(width) || !isNumber(height)) {
    throw new Error('Invalid window geometry');
  }

  return {
    left,
    top,
    width,
    height,
  };
}
