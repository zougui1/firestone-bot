import { Effect, pipe } from 'effect';

import { goTo } from './view';
import { click } from '../api';

const claimAndRestart = ({ name, left }: { name: string; left: `${number}%`; }) => {
  return pipe(
    Effect.logDebug(`Claiming experiment ${name}`),
    Effect.tap(() => click({ left, top: '75%' })),
    // close in case the gem confirmation dialog was opened
    Effect.tap(() => click({ left: 1, top: 1 })),
    Effect.tap(() => Effect.logDebug(`Starting experiment ${name}`)),
    Effect.tap(() => click({ left, top: '75%' })),
    // close in case the gem confirmation dialog was opened
    Effect.tap(() => click({ left: 1, top: 1 })),
    Effect.tap(() => Effect.log(`Handled experiment ${name}`)),
  );
}

export const handleExperiments = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => goTo.main()),
    Effect.tap(() => goTo.alchemist()),

    Effect.tap(() => claimAndRestart({ name: 'blood', left: '45%' })),
    Effect.tap(() => claimAndRestart({ name: 'exotic coins', left: '82.5%' })),

    Effect.withSpan('experiments'),
    Effect.withLogSpan('experiments'),
  ));
}
