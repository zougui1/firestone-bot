import { Effect, pipe, Queue } from 'effect';

import { event, game } from './store';
import { handleMapMissions, mapStore } from './features/map';
import { handleTrainGuardian } from './features/guardians';
import { handleCampaignLoot } from './features/campaign';
import { handleEngineerTools } from './features/engineer';
import { handlePickaxeSupplies } from './features/arcane-crystal';
import { handleExperiments } from './features/alchemist';
import { handleOracleRituals } from './features/oracle';
import { handleGuildExpeditions, guildStore } from './features/guild';
import { handleFirestoneResearch, firestoneLibraryStore } from './features/firestone-library';
import * as database from './database';
import { EventQueue, Event } from './eventQueue';
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
    const features = Object
      .entries(config.features)
      .filter(([, feature]) => feature.enabled)
      .map(([name]) => name) as event.ActionType[];

    yield* Effect.logDebug('Enabled game features:', features.join(', '));

    for (const feature of features) {
      if (feature in gameHandlers) {
        const eventQueue = yield* EventQueue;
        yield* eventQueue.add({ type: feature, timeoutMs: 1 });
      } else {
        yield* Effect.logWarning(`feature "${feature}" has no handler`);
      }
    }
  });
}

const routine = () => {
  return Effect.gen(function* () {
    yield* Effect.log('Starting routine');
    yield* handleGameFeatures();
  }).pipe(
    Effect.withSpan('routine'),
    Effect.withLogSpan('routine'),
  );
}

export const startBot = () => {
  return Effect.gen(function* () {
    yield* Effect.log('Starting bot');

    const queueMap: Record<event.ActionType, Queue.Queue<Event>> = {
      alchemyExperiment: yield* Queue.unbounded<Event>(),
      campaignLoot: yield* Queue.unbounded<Event>(),
      engineerTools: yield* Queue.unbounded<Event>(),
      firestoneResearch: yield* Queue.unbounded<Event>(),
      guardianTraining: yield* Queue.unbounded<Event>(),
      guildExpedition: yield* Queue.unbounded<Event>(),
      mapMission: yield* Queue.unbounded<Event>(),
      oracleRitual: yield* Queue.unbounded<Event>(),
      pickaxesClaiming: yield* Queue.unbounded<Event>(),
    };

    const add = (event: Event & { timeoutMs: number; }) => {
      return Effect.gen(function* () {
        yield* Effect.forkDaemon(Effect.gen(function* () {
          yield* Effect.sleep(event.timeoutMs);
          yield* queueMap[event.type].offer({ type: event.type });
        }));
      });
    }

    yield* Effect.provideService(routine(), EventQueue, { add });
    const processors = Object.values(queueMap).map(queue => Effect.gen(function* () {
      while (true) {
        const event = yield* Queue.take(queue);
        yield* Effect.logDebug(`Received event: ${event.type}`);
        const config = yield* init();
        const isEnabled = config.features[event.type].enabled;

        if (isEnabled) {
          yield* Effect.provideService(executeAction(event.type), EventQueue, { add });
        } else {
          yield* Effect.log(`Feature ${event.type} is disabled, ignoring event`);
        }
      }
    }));

    yield* Effect.all(processors, { concurrency: 'unbounded' }).pipe(
      Effect.withSpan('event'),
      Effect.withLogSpan('event'),
      Effect.onExit(() => {
        mapStore.trigger.reset();
        guildStore.trigger.reset();
        firestoneLibraryStore.trigger.reset();
        return Effect.void;
      }),
    );
  });
}
