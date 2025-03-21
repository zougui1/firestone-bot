import { goToView } from './view';
import { click } from '../api';
import { sleep } from 'radash';

export const handleOracleRituals = async () => {
  await goToView('oracle');

  try {
    console.log('going to rituals');
    // ritual button
    await click({ left: '43%', top: '40%' });
    await sleep(1500);

    console.log('claiming obedience');
    // obedience
    await click({ left: '61%', top: '81%' });
    await sleep(500);
    console.log('claiming serenity');
    // serenity
    await click({ left: '80%', top: '81%' });
    await sleep(500);
    console.log('claiming harmony');
    // harmony
    await click({ left: '80%', top: '48%' });
    await sleep(500);
    console.log('claiming concentration');
    // concentration
    await click({ left: '61%', top: '48%' });
    await sleep(500);
  } finally {
    await goToView('main');
  }
}
