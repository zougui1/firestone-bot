import { Effect, pipe } from 'effect';

import * as database from '../database';
import * as api from '../api';
import * as eventQueue from '../eventQueue';
import { env } from '../../env';

//! missing experiment speed up
//* {"Function":"AlchemistReplies","SubFunction":"CompleteAlchemyExperimentReply","Data":[0]}
//* {"Function":"AlchemistReplies","SubFunction":"StartAlchemyExperimentReply","Data":[0,27,1746271275]}

const experimentSlots = {
  blood: 0,
  dust: 1,
  'exoticCoins': 2,
};

type Experiment = keyof typeof experimentSlots;

const claimExperiment = ({ tree, slot, name }: { tree: number; slot: number; name: Experiment; }) => {
  return Effect.gen(function* () {
    const speedUpResult = yield* api.alchemist.speedUpExperiment({ tree, slot, gems: 0 }).pipe(
      Effect.as({ done: true }),
      Effect.catchTag('TimeoutError', () => pipe(
        Effect.logError(`Request to speed up experiment ${name} timed out`),
        Effect.as({ done: false }),
      )),
    );

    if (speedUpResult.done) {
      return speedUpResult;
    }

    return yield* api.alchemist.completeExperiment({ tree, slot }).pipe(
      Effect.as({ done: true }),
      Effect.catchTag('TimeoutError', () => pipe(
        Effect.logError(`Request to complete experiment ${name} timed out`),
        Effect.as({ done: false }),
      )),
    );
  });
}

const claimAndRestart = ({ name, config }: { name: Experiment; config: database.config.ConfigType['features']['alchemyExperiment']; }) => {
  return Effect.gen(function* () {
    const tree = config.treeLevel - 1;
    const slot = experimentSlots[name];

    yield* Effect.log(`Speeding up experiment: ${name}`);

    const claimResult = yield* claimExperiment({ tree, slot, name });

    if (!claimResult.done) {
      yield* eventQueue.add({
        type: 'alchemyExperiment',
        timeoutMs: env.firestone.blindTimeoutSeconds * 1000,
      });
      return;
    }

    const { done } = yield* api.alchemist.startExperiment({ tree, slot }).pipe(
      Effect.as({ done: true }),
      Effect.catchTag('TimeoutError', () => pipe(
        Effect.logError(`Request to start experiment ${name} timed out`),
        Effect.as({ done: false }),
      )),
    );

    const timeoutSeconds = done
      ? (config.durationMinutes * 60)
      : env.firestone.blindTimeoutSeconds;

    yield* eventQueue.add({
      type: 'alchemyExperiment',
      timeoutMs: timeoutSeconds * 1000,
    });
  });
}

export const handleExperiments = () => {
  return Effect.gen(function* () {
    const config = yield* database.config.findOne();
    const alchemy = config.features.alchemyExperiment;

    if (alchemy.blood) {
      yield* claimAndRestart({ name: 'blood', config: alchemy });
    }

    if (alchemy.dust) {
      yield* claimAndRestart({ name: 'dust', config: alchemy });
    }

    if (alchemy.exoticCoins) {
      yield* claimAndRestart({ name: 'exoticCoins', config: alchemy });
    }
  });
}
