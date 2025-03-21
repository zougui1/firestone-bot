import { findText } from '../api';
import { repeatUntil } from '../utils'

export const waitUntilGameLoaded = async () => {
  await repeatUntil({ delay: 1000 }, async () => {
    const texts = await findText({
      left: '94%',
      top: '94%',
      width: '4.5%',
      height: '3%',
      debug: true,
    });

    return texts.some(text => text.content.toLowerCase() === 'party');
  });
}
