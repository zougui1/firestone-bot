import { getIsGameRunning } from './getIsGameRunning';
import { repeatUntil } from '../utils';

export const startGame = async () => {
  const { execa } = await import('execa');

  execa('steam', ['steam://rungameid/1013320']);

  // wait until the game has started
  await repeatUntil({ delay: 1000 }, getIsGameRunning);
}
