import { Effect, pipe } from 'effect';

import * as database from '../database';
import * as api from '../api';
import * as eventQueue from '../eventQueue';
import { env } from '../../env';

// 2 = guardian index
//* {"Function":"MagicQuarterReplies","SubFunction":"GuardianTrainingReply","Data":[2]}

const guardianIds = {
  Vermillion: 0,
  Grace: 1,
  Ankaa: 2,
  Azhar: 3,
} as const;

export const handleTrainGuardian = () => {
  return Effect.gen(function* () {
    const config = yield* database.config.findOne();
    const { guardian } = config.features.guardianTraining;

    yield* Effect.log(`Training guardian ${guardian}`);
    const { trained } = yield* api.guardians.trainGuardian({
      id: guardianIds[guardian],
    }).pipe(
      Effect.as({ trained: true }),
      Effect.catchTag('TimeoutError', () => pipe(
        Effect.logError('Request to train guardian timed out'),
        Effect.as({ trained: false }),
      )),
    );

    const timeoutSeconds = trained ? (2 * 60 * 60) : env.firestone.blindTimeoutSeconds;
    yield* eventQueue.add({
      type: 'guardianTraining',
      timeoutMs: timeoutSeconds * 1000,
    });
  });
}
