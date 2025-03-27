import { Effect, pipe } from 'effect';

import { goTo } from './view';
import { click } from '../api';

export const handleEngineerTools = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => goTo.main()),
    Effect.tap(() => goTo.engineer()),
    Effect.tap(() => Effect.logDebug('Claiming tools')),
    Effect.tap(() => click({ left: '85%', top: '65%' })),
    Effect.tap(() => Effect.log('Claimed tools')),
    Effect.withSpan('engineerTools'),
    Effect.withLogSpan('engineerTools'),
  ));
}
