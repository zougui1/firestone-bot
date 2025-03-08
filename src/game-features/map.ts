import { goToView } from './view';
import { click, drag, findText } from '../game-bindings';

const iconWidth = 4.621;
const iconHeight = 11.4;

const clickPotentialIcon = async ({ left, top, debug }: { left: number; top: number; debug?: boolean; }) => {
  // click on potential icon; automatically claims it if it's finished
  await click({ left: `${left}%`, top: `${top}%`, debug });

  const [leftButton, rightButton] = await Promise.all([
    findText({
      left: '51%',
      top: '71%',
      width: '22%',
      height: '6%',
    }),
    findText({
      left: '65%',
      top: '71%',
      width: '22%',
      height: '6%',
    }),
  ]);

  if (rightButton.some(text => text.content.toLowerCase() === 'free')) {
    await click({ left: '65%', top: '71%', debug });
  }

  if (leftButton.some(text => text.content.toLowerCase() === 'start')) {
    await click({ left: '51%', top: '71%', debug });
  }

  // leave dialog
  await click({ left: '96%', top: '20%', debug });
}

const handleBottomMap = async () => {
  const left = 18;
  const right = 81;
  const top = 26;
  const bottom = 88;

  await drag({ top: '20%', x: '50%' });

  try {
    for (let row = left; row < right; row += iconWidth) {
      for (let col = top; col < bottom; col += iconHeight) {
        await clickPotentialIcon({ left: row, top: col });
      }
    }
  } finally {
    await drag({ top: '-20%', x: '50%' });
  }
}

const handleTopMap = async () => {
  const left = 20;
  const right = 79;
  const top = 20;
  const bottom = 87;

  await drag({ top: '-20%', x: '50%' });

  try {
    for (let row = left; row < right; row += iconWidth) {
      for (let col = top; col < bottom; col += iconHeight) {
        await clickPotentialIcon({ left: row, top: col });
      }
    }
  } finally {
    await drag({ top: '20%', x: '50%' });
  }
}

export const handleMapMissions = async () => {
  await goToView('map');

  try {
    // click on the whole map to claim finished missions
    await handleBottomMap();
    await handleTopMap();
    // click on the whole map again, this time to start new missions
    await handleBottomMap();
    await handleTopMap();
  } finally {
    await goToView('main');
  }
}
