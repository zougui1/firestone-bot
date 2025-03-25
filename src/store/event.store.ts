import { createStore } from '@xstate/store';
import { produce } from 'immer';
import { durationToSeconds } from '../utils';

export const actionTypes = [
  'campaignLoot',
  'mapMission',
  'oracleRitual',
  'engineerTools',
  'alchemyExperiment',
  'guardianTraining',
  'guildExpedition',
  'firestoneResearch',
  'pickaxesClaiming',
] as const;

export type ActionType = typeof actionTypes[number];

export interface ActionEvent {
  id: string;
  type: ActionType;
  duration: string;
}

export interface State {
  actions: Record<string, ActionEvent>;
  pendingActions: Record<string, ActionEvent>;
  invalidActions: Record<string, ActionEvent>;
}

const initialState: State = {
  actions: {},
  pendingActions: {},
  invalidActions: {},
};

export const store = createStore({
  context: initialState,

  on: {
    emitAction: (context, event: { action: ActionEvent; }, enqueue) => {
      const duration = durationToSeconds(event.action.duration);

      if (!duration) {
        console.log('added invalid action:', event.action);
        return produce(context, draft => {
          draft.invalidActions[event.action.id] = event.action;
        });
      }

      //! if the action is valid
      enqueue.effect(() => {
        setTimeout(() => {
          store.trigger.fullfillActionTimeout(event.action);
        }, duration * 1000);
      });

      console.log('added pending action:', event.action);
      return produce(context, draft => {
        draft.pendingActions[event.action.id] = event.action;
      });
    },

    addInvalidAction: (context, event: { action: ActionEvent; }, enqueue) => {
      console.log('added invalid action:', event.action);
      return produce(context, draft => {
        draft.invalidActions[event.action.id] = event.action;
      });
    },

    fullfillActionTimeout: (context, event: { id: string }) => {
      console.log('fullfilled action:', context.pendingActions[event.id]);
      return produce(context, draft => {
        if (!draft.pendingActions[event.id]) {
          return;
        }

        draft.actions[event.id] = draft.pendingActions[event.id];
        delete draft.pendingActions[event.id];
      });
    },

    deleteAction: (context, event: { id: string; }) => {
      console.log('delete action:', context.pendingActions[event.id]);
      return produce(context, draft => {
        delete draft.actions[event.id];
      });
    },
  },
});
