import { createStore } from '@xstate/store';
import { produce } from 'immer';

export type GuildSlotStatus = 'idle' | 'running' | 'unknown';

export interface GuildState {
  slot: { status: GuildSlotStatus };
}

const initialState: GuildState = {
  slot: { status: 'unknown' },
};

export const guildStore = createStore({
  context: initialState,

  on: {
    reset: () => initialState,

    updateSlotStatus: (context, event: { status: GuildSlotStatus; }) => {
      return produce(context, draft => {
        draft.slot.status = event.status;
      });
    },
  },
});
