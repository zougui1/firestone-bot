import { findText } from '../api';
import { checkAborted, repeatUntil } from '../utils'

export const waitUntilGameLoaded = async ({ signal }: { signal: AbortSignal; }) => {
  await repeatUntil({ delay: 1000 }, async () => {
    checkAborted(signal);

    const texts = await findText({
      left: '94%',
      top: '94%',
      width: '4.5%',
      height: '3%',
    });

    return texts.some(text => text.content.toLowerCase() === 'party');
  });
}
