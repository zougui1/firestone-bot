import { click } from '../game-bindings';
import { goToView } from './view';

export const handleCampaignLoot = async () => {
  await goToView('campaign');

  try {
    // claim loots
    await click({ left: '7%', top: '93%' });
  } finally {
    await goToView('main');
  }
}
