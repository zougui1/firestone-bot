import { goToView } from './view';
import { click } from '../api';

export const handleGuildExpeditions = async () => {
  await goToView('guildExpeditions');

  try {
    // claim expedition
    await click({ left: '68%', top: '28%' });
    // start new expedition
    await click({ left: '68%', top: '28%' });
  } finally {
    await goToView('main');
  }
}
