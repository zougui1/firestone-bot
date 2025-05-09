import { Effect, Queue } from 'effect';

import { event } from './store';

const queueMap: Record<event.ActionType, Effect.Effect<Queue.Queue<Event>, never, never>> = {
  alchemyExperiment: Queue.unbounded(),
  campaignLoot: Queue.unbounded(),
  engineerTools: Queue.unbounded(),
  firestoneResearch: Queue.unbounded(),
  guardianTraining: Queue.unbounded(),
  guildExpedition: Queue.unbounded(),
  mapMission: Queue.unbounded(),
  oracleRitual: Queue.unbounded(),
  pickaxesClaiming: Queue.unbounded(),
};

export interface Event {
  type: event.ActionType;
}

export const add = (event: Event & { timeoutMs: number; }) => {
  return Effect.gen(function* () {
    yield* Effect.forkDaemon(Effect.gen(function* () {
      yield* Effect.sleep(Date.now() - event.timeoutMs);
      const queue = yield* queueMap[event.type];
      yield* queue.offer({ type: event.type });
    }));
  });
}

export const process = (callback: (event: Event) => Effect.Effect<unknown>) => {
  return Effect.gen(function* () {
    const processors = Object.values(queueMap).map(queueEffect => Effect.gen(function* () {
      const queue = yield* queueEffect;
      const event = yield* Queue.take(queue);
      yield* callback(event);
    }));

    yield* Effect.all(processors, {
      concurrency: 'unbounded',
    });
  });
}
