import { getIsGameRunning } from './getIsGameRunning';
import { startGame } from './startGame';

export const ensureGameRunning = async () => {
  if (await getIsGameRunning()) {
    return;
  }

  await startGame();
}
