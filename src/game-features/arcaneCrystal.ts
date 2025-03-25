import { Console, Effect, pipe } from 'effect';

import { goTo } from './view';
import { click } from '../api';

export const handlePickaxeSupplies = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(goTo.main())),
    Effect.andThen(() => goTo.pickaxeSupplies()),
    Effect.tap(() => Console.log('pickaxe supplies: claiming pickaxes')),
    Effect.andThen(() => click({ left: '30%', top: '50%' })),
  ));
}
