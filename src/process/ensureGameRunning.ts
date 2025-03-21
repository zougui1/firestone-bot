import { getIsGameRunning } from './getIsGameRunning';
import { startGame } from './startGame';

export const ensureGameRunning = async () => {
  console.log('ensuring game is running');

  if (await getIsGameRunning()) {
    console.log('game is already running');
    return;
  }

  console.log('starting game');
  await startGame();
}
