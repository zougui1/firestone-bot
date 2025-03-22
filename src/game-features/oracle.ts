import { goToView } from './view';
import { click } from '../api';

const clickRituals = async () => {
  console.log('obedience');
  await click({ left: '61%', top: '81%' });
  console.log('serenity');
  await click({ left: '80%', top: '81%' });
  console.log('harmony');
  await click({ left: '80%', top: '48%' });
  console.log('concentration');
  await click({ left: '61%', top: '48%' });
}

export const handleOracleRituals = async () => {
  await goToView('oracle');

  try {
    console.log('going to rituals');
    await click({ left: '43%', top: '40%' });

    console.log('claiming');
    await clickRituals();
    console.log('starting new');
    await clickRituals();
  } finally {
    await goToView('main');
  }
}
