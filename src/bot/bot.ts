import { Effect, pipe } from 'effect';

import { event, game } from './store';
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
import * as api from './api';
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
  return pipe(
    init(),
    Effect.map(config => Object
      .entries(config.features)
      .filter(([, feature]) => feature.enabled)
      .map(([name]) => name) as event.ActionType[]
    ),
    Effect.tap(features => Effect.logDebug('Enabled game features:', features.join(', '))),
    Effect.tap(features => Effect.forEach(
      features,
      feature => {
        if (feature in gameHandlers) {
          return gameHandlers[feature]();
        }

        return Effect.logWarning(`feature "${feature}" has no handler`);
      },
      { discard: true },
    )),
  );
}

export const startBot = () => {
  return pipe(
    Effect.log('Starting bot'),
    //Effect.tap(() => init()),
    //Effect.flatMap(() => api.startCampaignBattle({ mission: 57, difficulty: 1 })),
    //Effect.tap(([, , { battleLogEntries }]) => Effect.log('entries:', battleLogEntries.length)),
    //Effect.flatMap(() => Effect.void),
    Effect.andThen(() => Effect.loop(true, {
      while: bool => bool,
      step: () => true,
      body: () => pipe(
        Effect.log('Starting routine'),
        Effect.andThen(handleGameFeatures),
        Effect.tap(() => Effect.logDebug('Waiting before next iteration')),
        Effect.tap(() => Effect.sleep('2 second')),
        Effect.withSpan('routine'),
        Effect.withLogSpan('routine'),
      ),
      discard: true,
    })),
  );
}
