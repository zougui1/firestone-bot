import { goToView } from './view';
import { click } from '../api';

export const handleGuildExpeditions = async () => {
  await goToView('guildExpeditions');

  try {
    console.log('claiming');
    // claim expedition
    await click({ left: '68%', top: '28%' });
    console.log('starting new');
    // start new expedition
    await click({ left: '68%', top: '28%' });
  } finally {
    await goToView('main');
  }
}
