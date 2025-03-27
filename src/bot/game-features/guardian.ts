import { Effect, pipe } from 'effect';

import { goTo } from './view';
import { GuardianName } from './data';
import { click } from '../api';
import * as database from '../database';

const guardianCoordinates = {
  Vermillion: { left: '40%', top: '90%' },
  Grace: { left: '45%', top: '90%' },
  Ankaa: { left: '55%', top: '90%' },
  Azhar: { left: '60%', top: '90%' },
} as const;

export const selectGuardian = (name: GuardianName) => {
  return pipe(
    Effect.logDebug(`Selecting guardian: ${name}`),
    Effect.tap(() => click(guardianCoordinates[name])),
  );
}

export const handleTrainGuardian = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => goTo.main()),
    Effect.tap(() => goTo.guardians()),
    Effect.flatMap(database.config.findOne),
    Effect.map(config => config.features.guardianTraining.guardian),
    Effect.tap(guardian => selectGuardian(guardian)),
    Effect.tap(guardian => Effect.logDebug(`Training guardian ${guardian}`)),
    Effect.tap(() => click({ left: '60%', top: '72%' })),
    Effect.tap(guardian => Effect.log(`Trained guardian ${guardian}`)),
    Effect.withSpan('trainingGuardian'),
    Effect.withLogSpan('trainingGuardian'),
  ));
}
