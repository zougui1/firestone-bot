import { Console, Effect, pipe } from 'effect';

import { goTo } from './view';
import { click } from '../api';

export const handleGuildExpeditions = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(goTo.main())),
    Effect.andThen(() => goTo.guildExpeditions()),
    Effect.tap(() => Console.log('expedition: claiming')),
    Effect.andThen(() => click({ left: '68%', top: '28%' })),
    Effect.tap(() => Console.log('expedition: starting new')),
    Effect.andThen(() => click({ left: '68%', top: '28%' })),
  ));
}
