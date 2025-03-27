import { Effect, pipe } from 'effect';

import { goTo } from './view';
import { click } from '../api';

const handleRitual = (name: string, coords: { left: `${number}%`; top: `${number}%`; }) => {
  return pipe(
    Effect.logDebug(`Claiming ritual: ${name}`),
    Effect.tap(() => click(coords)),
    Effect.tap(() => Effect.logDebug(`Starting ritual ${name}`)),
    Effect.tap(() => click(coords)),
  );
}

export const handleOracleRituals = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => goTo.main()),
    Effect.tap(() => goTo.oracle()),
    Effect.tap(() => Effect.log('Going to rituals')),
    Effect.tap(() => click({ left: '43%', top: '40%' })),

    Effect.tap(() => handleRitual('obedience', { left: '61%', top: '81%' })),
    Effect.tap(() => handleRitual('serenity', { left: '80%', top: '81%' })),
    Effect.tap(() => handleRitual('harmony', { left: '80%', top: '48%' })),
    Effect.tap(() => handleRitual('concentration', { left: '61%', top: '48%' })),

    Effect.withSpan('oracleRituals'),
    Effect.withLogSpan('oracleRituals'),
  ));
}
