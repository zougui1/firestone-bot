import { click } from '../game-bindings';
import { goToView } from './view';

export const handleEngineerTools = async () => {
  await goToView('engineer');

  try {
    // claim tools
    await click({ left: '85%', top: '65%' });
  } finally {
    await goToView('main');
  }
}
