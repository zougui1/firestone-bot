import { click } from '../game-bindings';
import { goToView } from './view';

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
