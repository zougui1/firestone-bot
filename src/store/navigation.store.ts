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

export interface State {
  views: ViewName[];
  isDialog: boolean;
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

    openDialog: (context) => {
      return produce(context, draft => {
        draft.isDialog = true;
      });
    },
  },
});
