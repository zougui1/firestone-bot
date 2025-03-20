import { isNumber } from 'radash';

export const findGameWindow = async () => {
  const { execa } = await import('execa');
  const geometryResult = await execa('xdotool', [
    'search',
    '--onlyvisible',
    '--name',
    '^Firestone$',
    'getwindowgeometry',
  ]);

  const geometryResultLines = geometryResult.stdout.toLowerCase().split('\n');
  const [left, top] = geometryResultLines
    .find(line => line.includes('position:'))
    ?.matchAll(/\d+/g).map(Number) ?? [];
  const [width, height] = geometryResultLines
    .find(line => line.includes('geometry:'))
    ?.matchAll(/\d+/g).map(Number) ?? [];;

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
