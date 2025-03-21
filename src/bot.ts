import { sleep } from 'radash';

import { store } from './store';
import {
  handleCampaignLoot,
  handleEngineerTools,
  handleGuildExpeditions,
  handleOracleRituals,
  handleMapMissions,
  handleFirestoneResearch,
  handleTrainGuardian,
  handleExperiments,
} from './game-features';
import {
  findGameWindow,
  ensureGameRunning,
  waitUntilGameLoaded,
} from './process';
import { click } from './api';

const checkAborted = (signal: AbortSignal) => {
  if (signal.aborted) {
    throw new Error(signal.reason ? `Aborted: ${signal.reason}` : 'Aborted');
  }
}

export const startBot = async ({ signal }: BotOptions) => {
  await ensureGameRunning();
  checkAborted(signal);

  const gameWindow = await findGameWindow();
  store.trigger.changeWindow(gameWindow);
  checkAborted(signal);

  await waitUntilGameLoaded();
  checkAborted(signal);

  while (true) {
    await click({ left: 0, top: 0 });
    await handleTrainGuardian();
    checkAborted(signal);
    await handleOracleRituals();
    checkAborted(signal);
    await handleEngineerTools();
    checkAborted(signal);
    await handleCampaignLoot();
    checkAborted(signal);
    await handleGuildExpeditions();
    checkAborted(signal);
    await handleExperiments();
    checkAborted(signal);
    await handleMapMissions();
    checkAborted(signal);

    //! not finished
    //await handleFirestoneResearch();
    //checkAborted(signal);

    await sleep(1000);
    checkAborted(signal);
  }
}

export interface BotOptions {
  signal: AbortSignal;
}
