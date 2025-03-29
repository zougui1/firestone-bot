import { Effect, pipe } from 'effect';

import { goTo } from './view';
import { click, findText } from '../api';

const claimAndRestart = ({ name, left }: { name: string; left: `${number}%`; }) => {
  return pipe(
    findText({
      left,
      top: '70.5%',
      width: '8%',
      height: '3.5%',
    }),
    Effect.flatMap(texts => Effect.if(
      texts.some(text => ['free', 'claim'].includes(text.content.toLowerCase())),
      {
        onTrue: () => pipe(
          Effect.logDebug(`Claiming experiment ${name}`),
          Effect.tap(() => click({ left, top: '75%' })),
          Effect.tap(() => Effect.logDebug(`Starting experiment ${name}`)),
          Effect.tap(() => click({ left, top: '75%' })),
          Effect.tap(() => Effect.log(`Handled experiment ${name}`)),
        ),
        onFalse: () => Effect.logDebug(`Experiment ${name} has not yet finished`),
      },
    )),
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
