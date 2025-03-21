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
import { checkAborted } from './utils';

export const startBot = async ({ signal }: BotOptions) => {
  await ensureGameRunning();
  checkAborted(signal);

  const gameWindow = await findGameWindow();
  store.trigger.changeWindow(gameWindow);
  checkAborted(signal);

  await waitUntilGameLoaded({
    signal: AbortSignal.any([
      signal,
      AbortSignal.timeout(60_000),
    ]),
  });
  checkAborted(signal);

  while (true) {
    await click({ left: 1, top: 1 });
    await handleTrainGuardian();
    await sleep(5000);
    checkAborted(signal);

    await handleOracleRituals();
    await sleep(5000);
    checkAborted(signal);

    await handleEngineerTools();
    await sleep(5000);
    checkAborted(signal);

    await handleCampaignLoot();
    await sleep(5000);
    checkAborted(signal);

    await handleGuildExpeditions();
    await sleep(5000);
    checkAborted(signal);

    await handleExperiments();
    await sleep(5000);
    checkAborted(signal);

    await handleMapMissions();
    await sleep(5000);
    checkAborted(signal);

    //! not finished
    //await handleFirestoneResearch();
    //await sleep(5000);
    //checkAborted(signal);
  }
}

export interface BotOptions {
  signal: AbortSignal;
}
