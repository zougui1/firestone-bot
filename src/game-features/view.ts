import { click, press } from '../api';
import { hotkeys } from '../hotkeys';
import { store, ViewName } from '../store';

export const navigateViews: Record<ViewName, () => Promise<void>> = {
  main: async () => {
    console.log('changing view: main');
    const { views } = store.getSnapshot().context;

    for (const _ of views) {
      console.log('changing view: back');
      await press({ key: hotkeys.escape });
      store.trigger.popView();
    }
  },
  town: async () => {
    console.log('changing view: town');
    await press({ key: hotkeys.town });
    store.trigger.navigateView({ view: 'town' });
  },
  alchemist: async () => {
    console.log('changing view: alchemist');
    await press({ key: hotkeys.alchemist });
    store.trigger.navigateView({ view: 'alchemist' });
  },
  oracle: async () => {
    console.log('changing view: oracle');
    await press({ key: hotkeys.oracle });
    store.trigger.navigateView({ view: 'oracle' });
  },
  guardians: async () => {
    console.log('changing view: guardians');
    await press({ key: hotkeys.guardians });
    store.trigger.navigateView({ view: 'guardians' });
  },
  library: async () => {
    console.log('changing view: library');
    await press({ key: hotkeys.library });
    store.trigger.navigateView({ view: 'library' });
  },
  map: async () => {
    console.log('changing view: map');
    await press({ key: hotkeys.map });
    // wait for animation to finish
    await click({ left: '96%', top: '45%' });
    store.trigger.navigateView({ view: 'map' });
  },
  engineerNavigation: async () => {
    console.log('changing view: engineerNavigation');
    await navigateViews.town();
    // engineer building button
    await click({ left: '65%', top: '80%' });
    store.trigger.navigateView({ view: 'engineerNavigation', isDialog: true });
  },
  engineer: async () => {
    console.log('changing view: engineer');
    await navigateViews.engineerNavigation();
    // engineer panel button
    await click({ left: '30%', top: '50%' });
    store.trigger.navigateView({ view: 'engineer' });
  },
  campaign: async () => {
    console.log('changing view: campaign');
    await press({ key: hotkeys.map });
    // wait for animation to finish
    await click({ left: '96%', top: '55%' });
    store.trigger.navigateView({ view: 'map' });
  },
  guild: async () => {
    console.log('changing view: guild');
    // guild icon
    await click({ left: '97%', top: '42%' });
    store.trigger.navigateView({ view: 'guild' });
  },
  guildExpeditions: async () => {
    console.log('changing view: guildExpeditions');
    await navigateViews.guild();
    // expedition building
    await click({ left: '20%', top: '32%' });
    store.trigger.navigateView({ view: 'guildExpeditions' });
  },
};

export const goToView = async (view: ViewName): Promise<void> => {
  await navigateViews[view]();
}
