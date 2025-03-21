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
import { click, findText, press } from './api';
import { checkAborted, repeatUntil } from './utils';
import { hotkeys } from './hotkeys';

const closeStartupDialogs = async ({ signal }: { signal: AbortSignal; }) => {
  const collectButton = {
    left: '43%',
    top: '84%',
  } as const;

  await sleep(5000);

  await repeatUntil({ delay: 1000 }, async () => {
    checkAborted(signal);

    const texts = await findText({
      ...collectButton,
      width: '14%',
      height: '5%',
    });

    return texts.some(text => text.content.toLowerCase().includes('collect the loot'));
  });

  await click(collectButton);
  await sleep(3000);

  const eventDialogTexts = await findText({
    left: '13%',
    top: '10%',
    width: '74%',
    height: '76%',
  });

  const isEventDialogOpen = eventDialogTexts.some(text => {
    const content = text.content.toLowerCase();
    return (
      content.includes('decorated heroes') ||
      content.includes('event') ||
      content.includes('unique rewards')
    );
  });

  if (isEventDialogOpen) {
    await press({ key: hotkeys.escape });
  }
}

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

  await closeStartupDialogs({ signal });

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
