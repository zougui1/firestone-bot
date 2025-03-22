import { goToView } from './view';
import { click, findText } from '../api';

const claimAndRestart = async ({ left }: { left: `${number}%`; }) => {
  const texts = await findText({
    left,
    top: '70.5%',
    width: '8%',
    height: '3.5%',
  });

  if (texts.some(text => text.content.toLowerCase() === 'speed up')) {
    console.log('ignored');
    return;
  }

  console.log('claiming');
  await click({ left, top: '75%' });
  console.log('starting new');
  await click({ left, top: '75%' });
}

export const handleExperiments = async () => {
  await goToView('alchemist');

  try {
    console.log('blood');
    await claimAndRestart({ left: '45%' });
    //console.log('exotic coins');
    //await claimAndRestart({ left: '81%' });
  } finally {
    await goToView('main');
  }
}
