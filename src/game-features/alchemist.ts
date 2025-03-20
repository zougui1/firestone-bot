import { sleep } from 'radash';

import { goToView } from './view';
import { click, findText } from '../game-bindings';

const claimAndRestart = async ({ left }: { left: `${number}%`; }) => {
  const texts = await findText({
    left,
    top: '70.5%',
    width: '8%',
    height: '3.5%',
  });

  if (texts.some(text => text.content.toLowerCase() === 'speed up')) {
    return;
  }

  // claim
  await click({ left, top: '75%' });
  await sleep(50);
  // start new
  await click({ left, top: '75%' });
}

export const handleExperiments = async () => {
  await goToView('alchemist');

  try {
    // blood
    await claimAndRestart({ left: '45%' });
    // exotic coins
    await claimAndRestart({ left: '81%' });
  } finally {
    await goToView('main');
  }
}
