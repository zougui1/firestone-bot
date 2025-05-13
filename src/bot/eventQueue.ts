import { Effect, Context } from 'effect';

import { event } from './store';

export class EventQueue extends Context.Tag('ProcessQueue')<EventQueue, {
  readonly add: (event: Event & { timeoutMs: number; }) => Effect.Effect<void, never, never>;
}>() {}

export interface Event {
  type: event.ActionType;
}
