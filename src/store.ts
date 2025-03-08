import { createStore } from '@xstate/store';
import { produce } from 'immer';

const views = [
  'main',
  'town',
  'alchemist',
  'oracle',
  'guardians',
  'library',
  'map',
  'campaign',
  'engineerNavigation',
  'engineer',
  'guild',
  'guildExpeditions',
] as const;

export type ViewName = typeof views[number];

export const guardians = ['Vermillion', 'Grace', 'Ankaa', 'Azhar'] as const;
export type GuardianName = typeof guardians[number];

export interface State {
  views: ViewName[];
  isDialog: boolean;
  currentGuardian: GuardianName;
  window: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export const store = createStore({
  context: {
    views: [],
    isDialog: false,
    currentGuardian: 'Vermillion',
    window: {
      left: 0,
      top: 0,
      width: 1920,
      height: 1080,
    },
  } as State,

  on: {
    changeWindow: (
      context,
      event: { left: number; top: number; width: number; height: number; }
    ) => {
      return produce(context, draft => {
        draft.window.left = event.left;
        draft.window.top = event.top;
        draft.window.width = event.width;
        draft.window.height = event.height;
      });
    },

    navigateView: (context, event: { view: ViewName; isDialog?: boolean; }) => {
      return produce(context, draft => {
        if (context.isDialog) {
          draft.views.pop();
        }

        draft.views.push(event.view);
        draft.isDialog = event.isDialog ?? false;
      });
    },

    popView: (context) => {
      return produce(context, draft => {
        draft.views = draft.views.slice(0, -1);
      });
    },

    changeGuardian: (context, event: { name: GuardianName }) => {
      return produce(context, draft => {
        draft.currentGuardian = event.name;
      });
    },

    openDialog: (context) => {
      return produce(context, draft => {
        draft.isDialog = true;
      });
    },
  },
});
