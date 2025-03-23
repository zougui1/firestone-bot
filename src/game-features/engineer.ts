import { Console, Effect, pipe } from 'effect';

import { goTo } from './view';
import { click } from '../api';

export const handleEngineerTools = () => {
  console.log('handleEngineerTools')
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(goTo.main())),
    Effect.andThen(() => goTo.engineer()),
    Effect.tap(() => Console.log('engineer: claiming tools')),
    Effect.andThen(() => click({ left: '85%', top: '65%' })),
  ));
}
