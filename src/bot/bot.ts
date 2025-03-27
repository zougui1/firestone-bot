import { Console, Effect, pipe } from 'effect';

import { event, navigation } from './store';
import {
  handleCampaignLoot,
  handleEngineerTools,
  handleGuildExpeditions,
  handleOracleRituals,
  handleMapMissions,
  handleFirestoneResearch,
  handleTrainGuardian,
  handleExperiments,
  goTo,
  handlePickaxeSupplies,
  handleCampaignFights,
} from './game-features';
import {
  findGameWindow,
  ensureGameRunning,
  waitUntilGameLoaded,
} from './process';
import { click } from './api';
import * as database from './database';

const closeStartupDialogs = () => {
  return Effect.loop(1, {
    while: iteration => iteration <= 5,
    step: iteration => iteration + 1,
    body: iteration => pipe(
      Console.log(`closing any potential startup dialog: ${iteration}`),
      Effect.andThen(() => click({ left: 1, top: 1 })),
    ),
    discard: true,
  });
}

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

const handleGameFeatures = () => {
  return pipe(
    database.config.findOne(),
    Effect.map(config => Object
      .entries(config.features)
      .filter(([, feature]) => feature.enabled)
      .map(([name]) => name) as event.ActionType[]
    ),
    Effect.tap(features => Console.log('enabled game features:', features.join(', '))),
    Effect.tap(features => Effect.forEach(
      features,
      feature => {
        if (feature in gameHandlers) {
          return gameHandlers[feature]();
        }

        return Console.log(`feature "${feature}" has no handler`);
      },
      { discard: true },
    )),
    Effect.tapError(cause => {
      return pipe(
        Console.log('an error occured while handling game features:', cause),
        Effect.tap(() => goTo.forceMain()),
      );
    }),
  );
}

export const startBot = (options?: BotOptions) => {
  return pipe(
    Effect.log('starting bot'),
    Effect.tap(() => {
      if (options?.disabledPreflightChecks) {
        return Console.log('Pre-flight checks disabled');
      }
    }),
    Effect.tap(() => {
      if (options?.disabledPreflightChecks) {
        return Console.log('ensuring game is running: skipped');
      }

      return ensureGameRunning();
    }),
    Effect.flatMap(findGameWindow),
    Effect.tap(gameWindow => navigation.store.trigger.changeWindow(gameWindow)),
    Effect.tap(() => {
      if (options?.disabledPreflightChecks) {
        return Console.log('waiting until game is loaded: skipped');
      }

      return waitUntilGameLoaded();
    }),
    Effect.timeoutOption('30 seconds'),
    Effect.tap(() => {
      if (options?.disabledPreflightChecks) {
        return Console.log('closing any potential startup dialog: skipped');
      }

      return closeStartupDialogs();
    }),
    //Effect.tap(() => Effect.tryPromise(handleCampaignFights)),
    //Effect.tap(() => Effect.sleep('1 minute')),
    Effect.andThen(() => Effect.loop(true, {
      while: bool => bool,
      step: () => true,
      body: () => pipe(
        Effect.log('Start routine'),
        Effect.andThen(() => click({ left: 1, top: 1 })),
        //Effect.andThen(handleGameFeatures),
        Effect.flatMap(() => Effect.fail('oh no')),
        Effect.tap(() => Effect.log('Waiting before next iteration')),
        Effect.tap(() => Effect.sleep('2 second')),
        Effect.withSpan('routine'),
        Effect.withLogSpan('routine'),
      ),
      discard: true,
    })),
  );
}

export interface BotOptions {
  disabledPreflightChecks?: boolean;
}
