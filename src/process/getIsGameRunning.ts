import { findGameWindow } from './findGameWindow'

export const getIsGameRunning = async () => {
  try {
    await findGameWindow();
    return true;
  } catch {
    return false;
  }
}
