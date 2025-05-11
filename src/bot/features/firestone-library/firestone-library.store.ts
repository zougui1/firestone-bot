import { createStore } from '@xstate/store';
import { produce } from 'immer';

export type FirestoneResearchSlotId = 0 | 1;

export interface FirestoneLibraryState {
  slots: {
    0: { id: 0; isAvailable: boolean; };
    1: { id: 1; isAvailable: boolean; };
  };
  upgrades: Record<string, { level: number; }>;
}

const initialState: FirestoneLibraryState = {
  slots: {
    0: { id: 0, isAvailable: false },
    1: { id: 1, isAvailable: false },
  },
  upgrades: {},
};

export const firestoneLibraryStore = createStore({
  context: initialState,

  on: {
    reset: () => initialState,

    updateSlot: (context, event: { id: FirestoneResearchSlotId; isAvailable: boolean; }) => {
      return produce(context, draft => {
        draft.slots[event.id].isAvailable = event.isAvailable;
      });
    },

    updateUpgrade: (context, event: { name: string; level: number; }) => {
      return produce(context, draft => {
        draft.upgrades[event.name] = { level: event.level };
      });
    },
  },
});
