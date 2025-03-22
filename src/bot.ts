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
  for (let iteration = 0; iteration < 5; iteration++) {
    checkAborted(signal);
    console.log('Closing any potential startup dialog:', iteration);
    await click({ left: 1, top: 1 });
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
  }
}

export interface BotOptions {
  signal: AbortSignal;
}
