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
import { findGameWindow } from './findGameWindow';
import { ensureGameRunning } from './ensureGameRunning';
import { waitUntilGameLoaded } from './waitUntilGameLoaded';

const main = async () => {
  await ensureGameRunning();

  const gameWindow = await findGameWindow();
  store.trigger.changeWindow(gameWindow);

  await waitUntilGameLoaded();

  while (true) {
    await handleTrainGuardian();
    await handleOracleRituals();
    await handleEngineerTools();
    await handleCampaignLoot();
    await handleGuildExpeditions();
    await handleMapMissions();
    await handleExperiments();

    //! not finished
    //await handleFirestoneResearch();

    await sleep(150);
  }
}

main();
