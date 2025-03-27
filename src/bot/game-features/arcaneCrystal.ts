import { Effect, pipe } from 'effect';

import { goTo } from './view';
import { click } from '../api';

export const handlePickaxeSupplies = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => goTo.main()),
    Effect.tap(() => goTo.pickaxeSupplies()),
    Effect.tap(() => Effect.logDebug('Claiming pickaxes')),
    Effect.tap(() => click({ left: '30%', top: '50%' })),
    Effect.tap(() => Effect.log('Pickaxe claimed')),
    Effect.withSpan('pickaxeSupplies'),
    Effect.withLogSpan('pickaxeSupplies'),
  ));
}
