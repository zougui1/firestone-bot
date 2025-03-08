import { isNumber, sleep } from 'radash';
import { click } from './game-bindings';
import { goToView } from './game-features/view';
import { store } from './store';
import {
  handleCampaignLoot,
  handleEngineerTools,
  handleGuildExpeditions,
  handleOracleRituals,
  handleMapMissions,
  handleFirestoneResearch,
} from './game-features';

const handleAlchemist = async () => {

}

const findGameWindow = async () => {
  const { execa } = await import('execa');
  const geometryResult = await execa('xdotool', [
    'search',
    '--onlyvisible',
    '--name',
    '^Firestone$',
    'getwindowgeometry',
  ]);

  const geometryResultLines = geometryResult.stdout.toLowerCase().split('\n');
  const [left, top] = geometryResultLines
    .find(line => line.includes('position:'))
    ?.matchAll(/\d+/g).map(Number) ?? [];
  const [width, height] = geometryResultLines
    .find(line => line.includes('geometry:'))
    ?.matchAll(/\d+/g).map(Number) ?? [];;

  if (!isNumber(left) || !isNumber(top) || !isNumber(width) || !isNumber(height)) {
    throw new Error('Invalid window geometry');
  }

  return {
    left,
    top,
    width,
    height,
  };
}

const main = async () => {
  console.time('window')
  const gameWindow = await findGameWindow();
  console.timeEnd('window')
  store.trigger.changeWindow(gameWindow);
  console.log('gameWindow:', gameWindow)

  // only in dev

  while (true) {
    await click({ left: 5, top: gameWindow.height / 2 });
    //await handleTrainGuardian();
    //await handleOracleRituals();
    //await handleEngineerTools();
    //await handleCampaignLoot();
    //await handleGuildExpeditions();
    //await handleMapMissions();

    //await drag({ left: '90%', top: 100, dragLeft: '80%' });

    //mawait drag({ left: '50%', top: '50%', dragUp: '-30%' });
    //await sleep(1500);
    //await drag({ left: '50%', top: '50%', dragDown: '20%' });

    //await handleMapMissions();

    await handleFirestoneResearch();

    await sleep(100);
    break;
  }
}

console.time('execution time');
main().finally(() => console.timeEnd('execution time'));
