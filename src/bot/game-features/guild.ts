import { Effect, pipe } from 'effect';

import { goTo } from './view';
import { click } from '../api';

export const handleGuildExpeditions = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => goTo.main()),
    Effect.andThen(() => goTo.guildExpeditions()),
    Effect.tap(() => Effect.logDebug('Claiming expedition')),
    Effect.tap(() => click({ left: '68%', top: '28%' })),
    Effect.tap(() => Effect.log('Claimed expedition')),

    Effect.tap(() => Effect.logDebug('Starting expedition')),
    Effect.tap(() => click({ left: '68%', top: '28%' })),
    Effect.tap(() => Effect.log('Started expedition')),

    Effect.withSpan('guildExpediitions'),
    Effect.withLogSpan('guildExpediitions'),
  ));
}
