import { Effect, Stream, Chunk, StreamEmit, pipe } from 'effect';

import { event, navigation } from './store';
import {
  handleCampaignLoot,
  handleEngineerTools,
  handleGuildExpeditions,
  handleOracleRituals,
  handleMapMissions,
  handleFirestoneResearch,
  guardian,
  handleExperiments,
  handlePickaxeSupplies,
} from './game-features';
import {
  findGameWindow,
  ensureGameRunning,
  waitUntilGameLoaded,
} from './process';
import { click } from './api';
import * as database from './database';
import { RuntimeFiber } from 'effect/Fiber';

const closeStartupDialogs = () => {
  return pipe(
    Effect.log('Closing any potential startup dialogs'),
    Effect.tap(() => Effect.loop(1, {
      while: iteration => iteration <= 5,
      step: iteration => iteration + 1,
      body: iteration => pipe(
        Effect.logDebug(`Click ${iteration}`),
        Effect.tap(() => click({ left: 1, top: 1 })),
      ),
      discard: true,
    })),
  );
}

const gameHandlers = {
  engineerTools: () => Effect.void,
  campaignLoot: () => Effect.void,
  guardianTraining: guardian.train,
  firestoneResearch: () => Effect.void,
  guildExpedition: () => Effect.void,
  oracleRitual: () => Effect.void,
  pickaxesClaiming: () => Effect.void,
  alchemyExperiment: () => Effect.void,
  mapMission: () => Effect.void,
} satisfies Record<event.ActionType, () => Effect.Effect<unknown, unknown, unknown>>;

const gameUnitHandlers = {
  engineerTools: () => Effect.void,
  campaignLoot: () => Effect.void,
  guardianTraining: guardian.train,
  firestoneResearch: () => Effect.void,
  guildExpedition: () => Effect.void,
  oracleRitual: () => Effect.void,
  pickaxesClaiming: () => Effect.void,
  alchemyExperiment: () => Effect.void,
  mapMission: () => Effect.void,
} satisfies Record<event.ActionType, () => Effect.Effect<unknown, unknown, unknown>>;

const handleGameFeatures = () => {
  return pipe(
    database.config.findOne(),
    Effect.map(config => Object
      .entries(config.features)
      .filter(([, feature]) => feature.enabled)
      .map(([name]) => name) as event.ActionType[]
    ),
    Effect.tap(features => Effect.logDebug('Enabled game features:', features.join(', '))),
    Effect.tap(features => Effect.forEach(
      features,
      feature => {
        if (feature in gameHandlers && feature === 'guardianTraining') {
          return gameHandlers[feature]();
        }

        return Effect.logWarning(`feature "${feature}" has no handler`);
      },
      { discard: true },
    )),
  );
}

const preflightChecks = (options?: BotOptions) => {
  return pipe(
    options?.disabledPreflightChecks
      ? Effect.log('Pre-flight checks disabled')
      : Effect.void,
    Effect.tap(() => {
      if (options?.disabledPreflightChecks) {
        return Effect.log('Ensuring game is running: skipped');
      }

      return ensureGameRunning();
    }),
    Effect.flatMap(findGameWindow),
    Effect.tap(gameWindow => navigation.store.trigger.changeWindow(gameWindow)),
    Effect.tap(() => {
      if (options?.disabledPreflightChecks) {
        return Effect.log('Waiting until game is loaded: skipped');
      }

      return pipe(
        waitUntilGameLoaded(),
        Effect.timeoutOption('30 seconds'),
      );
    }),
    Effect.tap(() => {
      if (options?.disabledPreflightChecks) {
        return Effect.log('Closing any potential startup dialog: skipped');
      }

      return closeStartupDialogs();
    }),
  );
}

const botRoutine = () => {
  return pipe(
    Effect.log('Starting routine'),
    Effect.andThen(() => click({ left: 1, top: 1 })),
    Effect.andThen(handleGameFeatures),
    Effect.withSpan('routine'),
    Effect.withLogSpan('routine'),
  );
}

const botActionStream = () => {
  let listener: ((action: event.ActionEvent) => unknown) | undefined;

  const stream = Stream.async((emit: StreamEmit.Emit<never, never, event.ActionEvent, void>) => {
    console.log('listening stream');

    listener = (action) => {
      console.log('emitting added action');
      emit(Effect.succeed(Chunk.of(action)));
    }

    console.log('on')
    event.on('resolvedAction', listener);
  });

  return Effect.scoped(pipe(
    Effect.addFinalizer(() => {
      if (listener) {
        console.log('off')
        event.off('resolvedAction', listener);
      }

      return Effect.void;
    }),

    // wait a bit to ensure the stream has started processing before the actions are
    // emitted to the stream
    Effect.tap(() => setTimeout(() => event.store.trigger.ready(), 1000)),
    Effect.tap(() => Effect.log('Ready to process stream of actions')),
    //? action processing prototype 2
    Effect.tap(() => stream.pipe(Stream.runForEach(action => Effect.scoped(pipe(
      Effect.addFinalizer(() => Effect.succeed(event.store.trigger.deleteAction({ id: action.id }))),
      Effect.tap(() => Effect.log(`Processing action ${action.type}`)),
      Effect.tap(() => gameUnitHandlers[action.type]()),
    ))))),
  ));
}

export const startBot = (options?: BotOptions) => {
  return Effect.scoped(pipe(
    Effect.log('Starting bot'),
    Effect.tap(() => preflightChecks(options)),
    Effect.tap(() => botRoutine()),
    Effect.tap(() => botActionStream()),

    //? routine alone
    /*Effect.andThen(() => Effect.loop(true, {
      while: bool => bool,
      step: () => true,
      body: () => pipe(
        Effect.log('Starting routine'),
        Effect.andThen(() => click({ left: 1, top: 1 })),
        Effect.andThen(handleGameFeatures),
        Effect.tap(() => Effect.logDebug('Waiting before next iteration')),
        Effect.tap(() => Effect.sleep('20 second')),
        Effect.withSpan('routine'),
        Effect.withLogSpan('routine'),
      ),
      discard: true,
    })),*/
  ));
}

export interface BotOptions {
  disabledPreflightChecks?: boolean;
}
