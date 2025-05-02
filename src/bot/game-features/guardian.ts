import { Effect, pipe } from 'effect';

import * as database from '../database';
import { sendRequest } from '../api';

const guardianIds = {
  Vermillion: 0,
  Grace: 1,
  Ankaa: 2,
  Azhar: 3,
} as const;

export const handleTrainGuardian = () => {
  return pipe(
    database.config.findOne(),
    Effect.map(config => config.features.guardianTraining.guardian),
    Effect.tap(guardian => Effect.log(`Training guardian ${guardian}`)),
    Effect.tap(guardian => sendRequest({
      type: 'GuardianTraining',
      parameters: [guardianIds[guardian]],
    })),
  );
}
