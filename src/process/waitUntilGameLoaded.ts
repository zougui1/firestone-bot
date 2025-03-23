import { Console, Effect } from 'effect';

import { findText } from '../api';

export const waitUntilGameLoaded = () => {
  return Effect.repeat(
    Console.log('Waiting for game to load').pipe(
      Effect.flatMap(() => findText({
        left: '94%',
        top: '94%',
        width: '4.5%',
        height: '3%',
      })),
      Effect.flatMap(texts => Effect.succeed(
        texts.some(text => text.content.toLowerCase() === 'party')
      )),
    ),
    { until: bool => bool },
  )
}
