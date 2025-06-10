import { Effect, pipe } from 'effect';

import * as database from '../../../database';
import * as api from '../../../api';
import { EventQueue } from '../../../eventQueue';
import { env } from '../../../../env';

const guardianIds = {
  Vermillion: 0,
  Grace: 1,
  Ankaa: 2,
  Azhar: 3,
} as const;

export const handleTrainGuardian = () => {
  return Effect.gen(function* () {
    const eventQueue = yield* EventQueue;
    const config = yield* database.config.findOne();
    const { guardian, cooldownSeconds } = config.features.guardianTraining;

    yield* Effect.log(`Training guardian ${guardian}`);
    const { trained } = yield* api.guardians.trainGuardian({
      id: guardianIds[guardian],
    }).pipe(
      Effect.as({ trained: true }),
      Effect.catchTag('TimeoutError', () => pipe(
        Effect.logWarning('Request to train guardian timed out'),
        Effect.as({ trained: false }),
      )),
    );

    const timeoutSeconds = trained ? cooldownSeconds : env.firestone.blindTimeoutSeconds;
    yield* eventQueue.add({
      type: 'guardianTraining',
      timeoutMs: timeoutSeconds * 1000,
    });
  }).pipe(
    Effect.withLogSpan('guardianTraining'),
    Effect.withSpan('guardianTraining'),
  );
}
