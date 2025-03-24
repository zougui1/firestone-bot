import { Chunk, Console, Context, Effect, Option, pipe, Ref, Stream, StreamEmit } from 'effect';

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

const initializedState = Ref.make(false);

class InitializedState extends Context.Tag("InitializedState")<
  InitializedState,
  Ref.Ref<boolean>
>() {}

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
  oracleRitual: handleOracleRituals,
  guildExpedition: handleGuildExpeditions,
  alchemyExperiment: handleExperiments,
  mapMission: handleMapMissions,
  //firestoneResearch: handleFirestoneResearch,
} satisfies Partial<Record<event.ActionType, () => Effect.Effect<unknown, unknown, unknown>>>;

const handleGameFeatures = () => {
  return pipe(
    InitializedState,
    Effect.flatMap(state => Ref.get(state)),
    Effect.flatMap(initialized => Effect.if(initialized, {
      onTrue: () => {
        const { invalidActions } = event.store.getSnapshot().context;

        return pipe(
          Console.log('handling failed actions'),
          Effect.tap(() => Effect.forEach(
            Object.values(invalidActions),
            action => Effect.if(action.type in gameHandlers, {
              onTrue: () => pipe(
                Console.log('handling action:', action),
                Effect.tap(() => gameHandlers[action.type as keyof typeof gameHandlers]()),
              ),
              onFalse: () => Console.log(`game feature ${action.type} is disabled`),
            }),
            { discard: true },
          )),
        );
      },
      onFalse: () => {
        const handlerKeys = Object.keys(gameHandlers) as (keyof typeof gameHandlers)[];

        return pipe(
          Console.log('handling game features:', handlerKeys.join(', ')),
          Effect.tap(() => Effect.forEach(
            handlerKeys,
            handlerKey => gameHandlers[handlerKey](),
            { discard: true },
          )),
        );
      },
    })),
    Effect.tapError(cause => {
      return pipe(
        Console.log('an error occured while handling game features:', cause),
        Effect.tap(() => goTo.forceMain()),
      );
    }),
  );
}

const handleActionEvents = () => {
  return pipe(
    Console.log('handling action events'),
    Effect.flatMap(() => pipe(
      Stream.async((emit: StreamEmit.Emit<never, never, event.ActionEvent, void>) => {
        const { actions } = event.store.getSnapshot().context;

        for (const [id, action] of Object.entries(actions)) {
          event.store.trigger.deleteAction({ id });
          emit(Effect.succeed(Chunk.of(action)));
        }
      }),
      Stream.runForEach(action => pipe(
        Console.log('handling action:', action),
        // TODO handle the action
        Effect.tap(() => event.store.trigger.deleteAction({ id: action.id })),
      )),
      Effect.timeoutOption('30 seconds'),
    )),
    Effect.flatMap(option => {
      if (Option.isNone(option)) {
        return pipe(
          Console.log('interrupted handling action events'),
          Effect.tap(() => goTo.forceMain()),
        );
      } else {
        return Console.log('done handling action events');
      }
    }),
    Effect.tapError(cause => {
      return pipe(
        Console.log('an error occured while handling action events:', cause),
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
        Effect.flatMap(() => InitializedState),
        Effect.tap(state => Ref.update(state, () => true)),
        Effect.andThen(handleActionEvents),
      ),
      discard: true,
    })),
    Effect.provideServiceEffect(InitializedState, initializedState),
  );
}

export interface BotOptions {
  signal: AbortSignal;
}
