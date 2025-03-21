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

const closeStartupDialogs = async ({ signal }: { signal: AbortSignal; }) => {
  for (let iteration = 0; iteration < 15; iteration++) {
    checkAborted(signal);
    console.log('Closing any potential startup dialog:', iteration);
    await click({ left: 1, top: 1 });
    await sleep(1000);
  }
}

export const startBot = async ({ signal }: BotOptions) => {
  console.log('starting bot');
  await ensureGameRunning();
  checkAborted(signal);

  const gameWindow = await findGameWindow();
  store.trigger.changeWindow(gameWindow);
  checkAborted(signal);

  await waitUntilGameLoaded({
    signal: AbortSignal.any([
      signal,
      AbortSignal.timeout(30_000),
    ]),
  });
  checkAborted(signal);

  await closeStartupDialogs({ signal });
  checkAborted(signal);

  while (true) {
    console.log('bot iteration\n');

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
