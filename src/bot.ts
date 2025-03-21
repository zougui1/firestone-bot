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
import { click, findText } from './api';
import { checkAborted, repeatUntil } from './utils';

const closeStartupDialogs = async ({ signal }: { signal: AbortSignal; }) => {
  await sleep(5000);

  await repeatUntil({ delay: 1000 }, async () => {
    checkAborted(signal);
    console.log('waiting for startup dialog to open');;

    const texts = await findText({
      left: '43%',
      top: '84%',
      width: '14%',
      height: '5%',
    });

    return texts.some(text => text.content.toLowerCase().includes('collect the loot'));
  });

  await click({ left: 1, top: 1 });
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
    console.log('closing event dialog');
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
      AbortSignal.timeout(60_000),
    ]),
  });
  checkAborted(signal);

  await closeStartupDialogs({ signal });

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
