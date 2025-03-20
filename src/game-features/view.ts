import { sleep } from 'radash';

import { click, press } from '../api';
import { hotkeys } from '../hotkeys';
import { store, ViewName } from '../store';

export const navigateViews: Record<ViewName, () => Promise<void>> = {
  main: async () => {
    const { views } = store.getSnapshot().context;

    for (const _ of views) {
      await press({ key: hotkeys.escape });
      store.trigger.popView();
      await sleep(1000);
    }
  },
  town: async () => {
    await press({ key: hotkeys.town });
    store.trigger.navigateView({ view: 'town' });
    await sleep(1000);
  },
  alchemist: async () => {
    await press({ key: hotkeys.alchemist });
    store.trigger.navigateView({ view: 'alchemist' });
    await sleep(1000);
  },
  oracle: async () => {
    await press({ key: hotkeys.oracle });
    store.trigger.navigateView({ view: 'oracle' });
    await sleep(1000);
  },
  guardians: async () => {
    await press({ key: hotkeys.guardians });
    store.trigger.navigateView({ view: 'guardians' });
    await sleep(1000);
  },
  library: async () => {
    await press({ key: hotkeys.library });
    store.trigger.navigateView({ view: 'library' });
    await sleep(1000);
  },
  map: async () => {
    await press({ key: hotkeys.map });
    // wait for animation to finish
    await sleep(150);
    await click({ left: '96%', top: '45%' });
    store.trigger.navigateView({ view: 'map' });
    await sleep(1000);
  },
  engineerNavigation: async () => {
    await navigateViews.town();
    // engineer building button
    await click({ left: '65%', top: '80%' });
    store.trigger.navigateView({ view: 'engineerNavigation', isDialog: true });
    await sleep(1000);
  },
  engineer: async () => {
    await navigateViews.engineerNavigation();
    // engineer panel button
    await click({ left: '30%', top: '50%' });
    store.trigger.navigateView({ view: 'engineer' });
    await sleep(1000);
  },
  campaign: async () => {
    await press({ key: hotkeys.map });
    // wait for animation to finish
    await sleep(150);
    await click({ left: '96%', top: '55%' });
    store.trigger.navigateView({ view: 'map' });
    await sleep(1000);
  },
  guild: async () => {
    // guild icon
    await click({ left: '97%', top: '42%' });
    store.trigger.navigateView({ view: 'guild' });
    await sleep(1000);
  },
  guildExpeditions: async () => {
    await navigateViews.guild();
    // expedition building
    await click({ left: '20%', top: '32%' });
    store.trigger.navigateView({ view: 'guildExpeditions' });
    await sleep(1000);
  },
};

export const goToView = async (view: ViewName): Promise<void> => {
  await navigateViews[view]();
}
