import { Console, Effect, pipe } from 'effect';
import nanoid from 'nanoid';

import { goTo } from './view';
import { click, findText } from '../api';
import { event } from '../store';

const guardians = ['Vermillion', 'Grace', 'Ankaa', 'Azhar'] as const;
type GuardianName = typeof guardians[number];

const guardianCoordinates = {
  Vermillion: { left: '40%', top: '90%' },
  Grace: { left: '45%', top: '90%' },
  Ankaa: { left: '55%', top: '90%' },
  Azhar: { left: '60%', top: '90%' },
} as const;

export const selectGuardian = (name: GuardianName) => {
  return pipe(
    Console.log(`selecting guardian: ${name}`),
    Effect.andThen(() => click(guardianCoordinates[name])),
  );
}

export const handleTrainGuardian = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(goTo.main())),
    Effect.andThen(() => goTo.guardians()),
    Effect.andThen(() => selectGuardian('Grace')),
    Effect.tap(() => Console.log('training guardian')),
    Effect.andThen(() => click({ left: '60%', top: '72%' })),
    Effect.flatMap(() => findText({
      left: '55.5%',
      top: '74%',
      width: '8%',
      height: '4%',
    })),
    Effect.tap(([text]) => event.store.trigger.emitAction({
      action: {
        id: nanoid(),
        type: 'guardianTraining',
        duration: text?.content ?? '0',
        data: undefined,
      },
    })),
    Effect.tapError(Console.log),
  ));
}
