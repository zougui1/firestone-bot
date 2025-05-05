import { createStore } from '@xstate/store';

export interface State {
  paused: boolean;
}

export const store = createStore({
  context: {} as State,

  on: {
    pause: () => {
      return { paused: true };
    },

    resume: () => {
      return { paused: false };
    },
  },
});
