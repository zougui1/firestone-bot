import { click } from '../game-bindings';
import { goToView } from './view';

export const handleOracleRituals = async () => {
  await goToView('oracle');

  try {
    // ritual button
    await click({ left: '43%', top: '40%' });
    // obedience
    await click({ left: '61%', top: '81%' });
    // serenity
    await click({ left: '80%', top: '81%' });
    // harmony
    await click({ left: '80%', top: '48%' });
    // concentration
    await click({ left: '61%', top: '48%' });
  } finally {
    await goToView('main');
  }
}
