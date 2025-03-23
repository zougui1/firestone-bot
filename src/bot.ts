import { Console, Effect, pipe } from 'effect';

import { store } from './store/navigation.store';
import {
  handleCampaignLoot,
  handleEngineerTools,
  handleGuildExpeditions,
  handleOracleRituals,
  handleMapMissions,
  handleFirestoneResearch,
  handleTrainGuardian,
  handleExperiments,
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

export const startBot = () => {
  return pipe(
    Console.log('starting bot'),
    Effect.andThen(ensureGameRunning),
    Effect.flatMap(findGameWindow),
    Effect.tap(gameWindow => store.trigger.changeWindow(gameWindow)),
    Effect.andThen(waitUntilGameLoaded),
    Effect.timeoutOption('30 seconds'),
    Effect.andThen(closeStartupDialogs),
    Effect.andThen(() => Effect.loop(true, {
      while: bool => bool,
      step: () => true,
      body: () => pipe(
        Console.log('bot iteration\n'),
        Effect.andThen(() => click({ left: 1, top: 1 })),
        Effect.andThen(handleTrainGuardian),
        Effect.andThen(handleOracleRituals),
        Effect.andThen(handleEngineerTools),
        Effect.andThen(handleCampaignLoot),
        Effect.andThen(handleGuildExpeditions),
        Effect.andThen(handleExperiments),
        Effect.andThen(handleMapMissions),
        //Effect.andThen(handleFirestoneResearch),
      ),
      discard: true,
    }))
  );
}

export interface BotOptions {
  signal: AbortSignal;
}
