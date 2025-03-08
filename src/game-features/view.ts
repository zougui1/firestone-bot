import { sleep } from 'radash';
import { click, press } from '../game-bindings';
import { hotkeys } from '../hotkeys';
import { store, ViewName } from '../store';

export const navigateViews: Record<ViewName, () => Promise<void>> = {
  main: async () => {
    const { views } = store.getSnapshot().context;

    for (const _ of views) {
      await press({ key: hotkeys.escape });
      store.trigger.popView();
    }
  },
  town: async () => {
    await press({ key: hotkeys.town });
    store.trigger.navigateView({ view: 'town' });
  },
  alchemist: async () => {
    await press({ key: hotkeys.alchemist });
    store.trigger.navigateView({ view: 'alchemist' });
  },
  oracle: async () => {
    await press({ key: hotkeys.oracle });
    store.trigger.navigateView({ view: 'oracle' });
  },
  guardians: async () => {
    await press({ key: hotkeys.guardians });
    store.trigger.navigateView({ view: 'guardians' });
  },
  library: async () => {
    await press({ key: hotkeys.library });
    store.trigger.navigateView({ view: 'library' });
  },
  map: async () => {
    await press({ key: hotkeys.map });
    store.trigger.navigateView({ view: 'map' });
  },
  engineerNavigation: async () => {
    await navigateViews.town();
    // engineer building button
    await click({ left: '65%', top: '80%' });
    store.trigger.navigateView({ view: 'engineerNavigation', isDialog: true });
  },
  engineer: async () => {
    await navigateViews.engineerNavigation();
    // engineer panel button
    await click({ left: '30%', top: '50%' });
    store.trigger.navigateView({ view: 'engineer' });
  },
  campaign: async () => {
    await navigateViews.map();
    // wait for animation to finish
    await sleep(150);
    await click({ left: '96%', top: '55%' });
    store.trigger.popView();
    store.trigger.navigateView({ view: 'map' });
  },
  guild: async () => {
    // guild icon
    await click({ left: '97%', top: '42%' });
    store.trigger.navigateView({ view: 'guild' });
  },
  guildExpeditions: async () => {
    await navigateViews.guild();
    // expedition building
    await click({ left: '20%', top: '32%' });
    store.trigger.navigateView({ view: 'guildExpeditions' });
  },
};

export const goToView = async (view: ViewName): Promise<void> => {
  await navigateViews[view]();
}
