import { sleep } from 'radash';

import { goToView } from './view';
import { click, drag, findText, press } from '../api';
import { hotkeys } from '../hotkeys';
import { calcPosition } from '../utils';

const startMissions = async ({ squads }: { squads: number; }) => {
  let missionsStarted = 0;

  const left = '18%';
  const top = '20%';

  const texts = await findText({
    left,
    top,
    width: '63%',
    height: '68%',
  });

  const durations = texts.filter(text => /\d/.test(text.content));

  for (const duration of durations) {
    if (squads - missionsStarted <= 0) {
      break;
    }

    await click({
      left: calcPosition(left, 'width') + duration.left,
      top: calcPosition(top, 'height') + duration.top,
    });
    // wait for the dialog to open and be interactable
    await sleep(1000);

    const [missionLabelTexts, leftButtonTexts] = await Promise.all([
      findText({
        left: '22%',
        top: '20%',
        width: '25%',
        height: '5%',
      }),
      findText({
        left: '50%',
        top: '81%',
        width: '13%',
        height: '6%',
        debug: true
      }),
    ]);

    if (missionLabelTexts.some(text => text.content.toLowerCase().includes('mission'))) {
      missionsStarted++;

      if (leftButtonTexts.some(text => text.content.toLowerCase().includes('start'))) {
        await click({ left: '51%', top: '81%' });
      } else {
        await press({ key: hotkeys.escape });
      }
    }
  }

  return { missionsStarted };
}

const handleBottomMap = async ({ squads }: { squads: number; }) => {
  await drag({ top: '20%', x: '99%', });

  try {
    return await startMissions({ squads });
  } finally {
    await drag({ top: '-20%', x: '99%' });
  }

  return { missionsStarted: 0 };
}

const handleTopMap = async ({ squads }: { squads: number; }) => {
  await drag({ top: '-20%', x: '99%' });

  try {
    return await startMissions({ squads });
  } finally {
    await drag({ top: '20%', x: '99%' });
  }

  return { missionsStarted: 0 };
}

const claimMissions = async () => {
  const left = '5%';
  const top = '28%';

  const checkClaimButton = async () => {
    const texts = await findText({
      left,
      top,
      width: '8%',
      height: '5%',
    });

    return texts.some(text => text.content.toLowerCase().includes('claim'));
  }

  while (await checkClaimButton()) {
    await click({ left, top });
    // wait for the dialog to open and be interactable
    await sleep(1000);
    await press({ key: hotkeys.escape });
  }
}

export const handleMapMissions = async () => {
  await goToView('map');

  try {
    await claimMissions();

    const [text] = await findText({
      left: '62%',
      top: '2%',
      width: '5%',
      height: '3%',
    });

    let [squads] = text?.content.split('/').map(Number);

    if (!squads) {
      return;
    }

    console.log('available squads');

    const { missionsStarted } = await handleBottomMap({ squads });
    squads -= missionsStarted;

    if (squads <= 0) {
      return;
    }

    await handleTopMap({ squads });
  } finally {
    await goToView('main');
  }
}
