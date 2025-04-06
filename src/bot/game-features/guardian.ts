import { Effect, pipe } from 'effect';

import { goTo } from './view';
import { click, findDurations } from '../api';
import * as database from '../database';
import { event } from '../store';

const guardianCoordinates = {
  Vermillion: { left: '40%', top: '90%' },
  Grace: { left: '45%', top: '90%' },
  Ankaa: { left: '55%', top: '90%' },
  Azhar: { left: '60%', top: '90%' },
} as const;

export const train = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => goTo.main()),
    Effect.tap(() => goTo.guardians()),
    Effect.flatMap(database.config.findOne),
    Effect.map(config => config.features.guardianTraining.guardian),
    Effect.tap(guardian => Effect.log(`Selecting guardian: ${guardian}`)),
    Effect.tap(guardian => click(guardianCoordinates[guardian])),
    Effect.tap(guardian => Effect.log(`Training guardian: ${guardian}`)),
    Effect.tap(() => click({ left: '60%', top: '72%' })),
    Effect.tap(guardian => Effect.log(`Trained guardian: ${guardian}`)),
    Effect.tap(() => Effect.log('Finding cooldown')),
    Effect.flatMap(() => findDurations({
      left: '55%',
      top: '73.5%',
      width: '9%',
      height: '5%',
      debug: true,
    })),
    Effect.catchAll(error => pipe(
      Effect.log(`${error._tag}: using fallback cooldown`),
      Effect.as([{ seconds: 60 }]),
    )),
    Effect.tap(([duration]) => Effect.log(`Training cooldown: ${duration.seconds} seconds`)),
    Effect.tap(([duration]) => event.store.trigger.addAction({
      action: {
        seconds: duration.seconds,
        type: 'guardianTraining',
      },
    })),
    Effect.withSpan('trainingGuardian'),
    Effect.withLogSpan('trainingGuardian'),
  ));
}
