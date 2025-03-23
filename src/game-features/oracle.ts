import { Console, Effect, pipe } from 'effect';

import { goTo } from './view';
import { click } from '../api';

const handleRitual = (name: string, coords: { left: `${number}%`; top: `${number}%`; }) => {
  return pipe(
    Console.log(`ritual: claiming ${name}`),
    Effect.andThen(() => click(coords)),
    Effect.tap(() => Console.log(`ritual: starting ${name}`)),
    Effect.andThen(() => click(coords)),
  );
}

export const handleOracleRituals = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(goTo.main())),
    Effect.andThen(() => goTo.oracle()),
    Effect.tap(() => Console.log('going to rituals')),
    Effect.andThen(() => click({ left: '43%', top: '40%' })),

    Effect.andThen(() => handleRitual('obedience', { left: '61%', top: '81%' })),
    Effect.andThen(() => handleRitual('serenity', { left: '80%', top: '81%' })),
    Effect.andThen(() => handleRitual('harmony', { left: '80%', top: '48%' })),
    Effect.andThen(() => handleRitual('concentration', { left: '61%', top: '48%' })),
  ));
}
