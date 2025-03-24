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
} from './game-features';
import {
  findGameWindow,
  ensureGameRunning,
  waitUntilGameLoaded,
} from './process';
import { click } from './api';

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
  guildExpedition: handleGuildExpeditions,
  oracleRitual: handleOracleRituals,
  //alchemyExperiment: handleExperiments,
  mapMission: handleMapMissions,
  //firestoneResearch: handleFirestoneResearch,
} satisfies Partial<Record<event.ActionType, () => Effect.Effect<unknown, unknown, unknown>>>;

const handleGameFeatures = () => {
  const handlerKeys = Object.keys(gameHandlers) as (keyof typeof gameHandlers)[];

  return pipe(
    Console.log('enabled game features:', handlerKeys.join(', ')),
    Effect.tap(() => Effect.forEach(
      handlerKeys,
      handlerKey => gameHandlers[handlerKey](),
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

export const startBot = () => {
  return pipe(
    Console.log('starting bot'),
    Effect.andThen(ensureGameRunning),
    Effect.flatMap(findGameWindow),
    Effect.tap(gameWindow => navigation.store.trigger.changeWindow(gameWindow)),
    Effect.tap(() => click({ left: '99%', top: '15%', debug: true })),
    Effect.flatMap(() => Effect.fail('stopped')),
    Effect.andThen(waitUntilGameLoaded),
    Effect.timeoutOption('30 seconds'),
    Effect.andThen(closeStartupDialogs),
    Effect.andThen(() => Effect.loop(true, {
      while: bool => bool,
      step: () => true,
      body: () => pipe(
        Console.log('bot iteration\n'),
        Effect.andThen(() => click({ left: 1, top: 1 })),
        Effect.andThen(handleGameFeatures),
      ),
      discard: true,
    })),
  );
}

export interface BotOptions {
  signal: AbortSignal;
}
