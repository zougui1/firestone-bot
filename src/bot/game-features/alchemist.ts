import { Effect, pipe } from 'effect';

import * as database from '../database';
import { sendRequest } from '../api';

const experimentSlots = {
  blood: 0,
  dust: 1,
  'exoticCoins': 2,
};

const claimAndRestart = ({ name, treeLevel }: { name: keyof typeof experimentSlots; treeLevel: number; }) => {
  return pipe(
    Effect.log(`Speeding up experiment: ${name}`),
    Effect.tap(() => sendRequest({
      type: 'DoAlchemyExperimentSpeedUp',
      parameters: [treeLevel - 1, experimentSlots[name], 0],
    })),
    Effect.tap(() => Effect.log(`Claiming experiment: ${name}`)),
    Effect.tap(() => sendRequest({
      type: 'CompleteAlchemyExperiment',
      parameters: [treeLevel - 1, experimentSlots[name]],
    })),
    Effect.tap(() => Effect.log(`Starting experiment: ${name}`)),
    Effect.tap(() => sendRequest({
      type: 'StartAlchemyExperiment',
      parameters: [treeLevel - 1, experimentSlots[name]],
    })),
  );
}

export const handleExperiments = () => {
  return Effect.gen(function* () {
    const config = yield* database.config.findOne();
    const alchemy = config.features.alchemyExperiment;

    if (alchemy.blood) {
      yield* claimAndRestart({ name: 'blood', treeLevel: alchemy.treeLevel });
    }
    if (alchemy.dust) {
      yield* claimAndRestart({ name: 'dust', treeLevel: alchemy.treeLevel });
    }
    if (alchemy.exoticCoins) {
      yield* claimAndRestart({ name: 'exoticCoins', treeLevel: alchemy.treeLevel });
    }
  });
}
