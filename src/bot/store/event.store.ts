import { createStore } from '@xstate/store';
import { produce } from 'immer';
import nanoid from 'nanoid';
import Emittery from 'emittery';
import { type SetOptional } from 'type-fest';

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
  seconds: number;
}

export interface State {
  ready: boolean;
  actions: Record<string, ActionEvent>;
  pendingActions: Record<string, ActionEvent>;
}

const initialState: State = {
  ready: false,
  actions: {},
  pendingActions: {},
};

export interface Emitter {
  resolvedAction: ActionEvent;
}

const emitter = new Emittery<Emitter>();

export const store = createStore({
  context: initialState,

  on: {
    ready: (context, event, enqueue) => {
      const newContext = {
        ...context,
        ready: true,
        actions: context.pendingActions,
        pendingActions: {},
      };

      enqueue.effect(() => {
        for (const action of Object.values(newContext.actions)) {
          console.log('timeoutAction')
          setTimeout(() => {
            emitter.emit('resolvedAction', action);
          }, action.seconds * 1000);
        }
      });

      return newContext;
    },

    addAction: (context, event: { action: SetOptional<ActionEvent, 'id'>; }, enqueue) => {
      const action = {
        ...event.action,
        id: event.action.id ?? nanoid(),
      };

      if (!context.ready) {
        return produce(context, draft => {
          draft.pendingActions[action.id] = action;
        });
      }

      enqueue.effect(() => {
        setTimeout(() => {
          emitter.emit('resolvedAction', action);
        }, action.seconds * 1000);
      });

      return produce(context, draft => {
        draft.actions[action.id] = action;
      });
    },

    deleteAction: (context, event: { id: string; }) => {
      return produce(context, draft => {
        delete draft.actions[event.id];
      });
    },
  },
});

export const on = <E extends keyof Emitter>(event: E, listener: (data: Emitter[E]) => void) => {
  emitter.on(event, listener);
}
export const off = <E extends keyof Emitter>(event: E, listener: (data: Emitter[E]) => void) => {
  emitter.off(event, listener);
}
