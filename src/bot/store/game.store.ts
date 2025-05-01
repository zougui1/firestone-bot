import { createStore } from '@xstate/store';
import { Effect } from 'effect';

export interface State {
  userId?: string;
  sessionId?: string;
  serverName?: string;
}

export const store = createStore({
  context: {} as State,

  on: {
    init: (context, event: State) => {
      return {
        userId: event.userId,
        sessionId: event.sessionId,
        serverName: event.serverName,
      };
    },
  },
});

export const getSession = () => {
  const {
    userId,
    sessionId,
    serverName,
  } = store.getSnapshot().context;

  if (!userId) {
    return Effect.die(new Error('Missing Firestone user ID'));
  }

  if (!sessionId) {
    return Effect.die(new Error('Missing Firestone session ID'));
  }

  if (!serverName) {
    return Effect.die(new Error('Missing Firestone server'));
  }

  return Effect.succeed({
    userId,
    sessionId,
    serverName,
  });
}
