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
      if (feature in gameHandlers) {
        yield* gameHandlers[feature]();
      } else {
        yield* Effect.logWarning(`feature "${feature}" has no handler`);
      }
    }
  });
}

export const startBot = () => {
  return pipe(
    Effect.log('Starting bot'),
    Effect.andThen(() => Effect.loop(true, {
      while: bool => bool,
      step: () => true,
      body: () => pipe(
        Effect.log('Starting routine'),
        Effect.andThen(handleGameFeatures),
        Effect.tap(() => Effect.logDebug('Waiting before next iteration')),
        Effect.tap(() => Effect.sleep('2 minutes')),
        Effect.withSpan('routine'),
        Effect.withLogSpan('routine'),
      ),
      discard: true,
    })),
  );
}
