import { goToView } from './view';
import { click } from '../api';

export const handleEngineerTools = async () => {
  await goToView('engineer');

  try {
    console.log('claiming tools');
    // claim tools
    await click({ left: '85%', top: '65%' });
  } finally {
    await goToView('main');
  }
}
