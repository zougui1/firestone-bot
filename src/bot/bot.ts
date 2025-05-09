import { Effect, pipe } from 'effect';

import { event, game, bot } from './store';
import {
  handleCampaignLoot,
  handleEngineerTools,
  handleGuildExpeditions,
  handleOracleRituals,
  handleMapMissions,
  handleFirestoneResearch,
  handleTrainGuardian,
  handleExperiments,
  handlePickaxeSupplies,
} from './game-features';
import * as database from './database';
import * as eventQueue from './eventQueue';
import { env } from '../env';

const gameHandlers = {
  engineerTools: handleEngineerTools,
  campaignLoot: handleCampaignLoot,
  guardianTraining: handleTrainGuardian,
  firestoneResearch: handleFirestoneResearch,
  guildExpedition: handleGuildExpeditions,
  oracleRitual: handleOracleRituals,
  pickaxesClaiming: handlePickaxeSupplies,
  alchemyExperiment: handleExperiments,
  mapMission: handleMapMissions,
} satisfies Record<event.ActionType, () => Effect.Effect<unknown, unknown, unknown>>;

const init = () => {
  return pipe(
    database.config.findOne(),
    Effect.tap(config => {
      if (!config.sessionId.trim()) {
        return Effect.die(new Error('Missing session ID'));
      }

      game.store.trigger.init({
        userId: env.firestone.userId,
        sessionId: config.sessionId,
        serverName: env.firestone.server,
      });
    }),
  );
}

const executeAction = (type: event.ActionType) => {
  return Effect.gen(function* () {
    if (type in gameHandlers) {
      yield* gameHandlers[type]().pipe(Effect.catchAll(Effect.logError));
    } else {
      yield* Effect.logWarning(`feature "${type}" has no handler`);
    }
  });
}

const handleGameFeatures = () => {
  return Effect.gen(function* () {
    const config = yield* init();

    if (config.disabled) {
      bot.store.trigger.pause();
      yield* Effect.log('Bot is paused, skipping routine');
      return;
    };

    bot.store.trigger.resume();

    const features = Object
      .entries(config.features)
      .filter(([, feature]) => feature.enabled)
      .map(([name]) => name) as event.ActionType[];

    yield* Effect.logDebug('Enabled game features:', features.join(', '));

    for (const feature of features) {
      yield* executeAction(feature);
    }
  });
}

const routine = () => {
  return Effect.gen(function* () {
    yield* Effect.log('Starting routine');
    yield* handleGameFeatures();
    yield* Effect.logDebug('Waiting before next iteration');
    yield* Effect.sleep('2 minutes');
  }).pipe(
    Effect.withSpan('routine'),
    Effect.withLogSpan('routine'),
  );
}

export const startBot = () => {
  return Effect.gen(function* () {
    yield* Effect.log('Starting bot');
    yield* routine();

    yield* eventQueue.process(event => Effect.gen(function* () {
      yield* Effect.log(`Received event: ${event.type}`);
      const config = yield* init();

      if (config.disabled) {
        bot.store.trigger.pause();
        yield* Effect.log('Bot is paused, ignoring event');
        return;
      };

      bot.store.trigger.resume();

      const isEnabled = config.features[event.type].enabled;

      if (!isEnabled) {
        yield* Effect.log(`Feature ${event.type} is disabled, ignoring event`);
        return;
      }

      yield* executeAction(event.type);
    }).pipe(
      Effect.withSpan('event'),
      Effect.withLogSpan('event'),
    ));
  });
}
