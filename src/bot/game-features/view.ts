import { Effect, pipe } from 'effect';

import { click, press } from '../api';
import { hotkeys } from '../hotkeys';
import { navigation } from '../store';

export const goTo = {
  main: () => pipe(
    Effect.log('Changing view: main'),
    Effect.as(navigation.store.getSnapshot().context),
    Effect.flatMap(({ views }) => {
      return Effect.forEach(views, () => pipe(
        Effect.log('Changing view: back'),
        Effect.andThen(press({ key: hotkeys.escape })),
        Effect.tap(() => navigation.store.trigger.popView()),
      ), { discard: true });
    }),
  ),
  forceMain: () => pipe(
    Effect.log('Corcing to change view: main'),
    Effect.flatMap(() => {
      return Effect.loop(5, {
        while: iteration => iteration > 0,
        step: iteration => iteration - 1,
        body: () => pipe(
          Effect.log('Changing view: back'),
          Effect.andThen(press({ key: hotkeys.escape })),
        ),
        discard: true,
      });
    }),
    // click somewhere where there is no buttons to leave the exit dialog
    // if it's open, or if it's not open not trigger any UI element
    Effect.tap(() => click({ left: 1, top: '15%' })),
    Effect.tap(() => navigation.store.trigger.mainScreen()),
  ),
  town: () => pipe(
    Effect.log('changing view: town'),
    Effect.andThen(() => press({ key: hotkeys.town })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'town' })),
  ),
  alchemist: () => pipe(
    Effect.log('changing view: alchemist'),
    Effect.andThen(() => press({ key: hotkeys.alchemist })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'alchemist' })),
  ),
  oracle: () => pipe(
    Effect.log('changing view: oracle'),
    Effect.andThen(() => press({ key: hotkeys.oracle })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'oracle' })),
  ),
  guardians: () => pipe(
    Effect.log('changing view: guardians'),
    Effect.andThen(() => press({ key: hotkeys.guardians })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'guardians' })),
  ),
  library: () => pipe(
    Effect.log('changing view: library'),
    Effect.andThen(() => press({ key: hotkeys.library })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'library' })),
  ),
  firestoneLibrary: () => pipe(
    goTo.library(),
    Effect.tap(() => Effect.log('changing view: firestoneLibrary')),
    Effect.andThen(() => click({ left: '95%', top: '60%' })),
  ),
  map: () => pipe(
    Effect.log('changing view: map'),
    Effect.andThen(() => press({ key: hotkeys.map })),
    // ensures we're in the map missions and not the campaign
    Effect.andThen(click({ left: '96%', top: '45%' })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'map' })),
  ),
  engineerNavigation: () => pipe(
    goTo.town(),
    Effect.tap(() => Effect.log('changing view: engineerNavigation')),
    // engineer building button
    Effect.andThen(click({ left: '65%', top: '80%' })),
    Effect.tap(() => navigation.store.trigger.navigateView({
      view: 'engineerNavigation',
      isDialog: true,
    })),
  ),
  engineer: () => pipe(
    goTo.engineerNavigation(),
    Effect.tap(() => Effect.log('changing view: engineer')),
    // engineer panel button
    Effect.andThen(click({ left: '30%', top: '50%' })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'engineer' })),
  ),
  campaign: () => pipe(
    Effect.log('changing view: campaign'),
    Effect.andThen(() => press({ key: hotkeys.map })),
    Effect.andThen(click({ left: '96%', top: '55%' })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'campaign' })),
  ),
  guild: () => pipe(
    Effect.log('changing view: guild'),
    Effect.andThen(() => click({ left: '97%', top: '42%' })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'guild' })),
  ),
  guildExpeditions: () => pipe(
    goTo.guild(),
    Effect.tap(() => Effect.log('changing view: guildExpeditions')),
    Effect.andThen(click({ left: '20%', top: '32%' })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'guildExpeditions' })),
  ),
  arcaneCrystal: () => pipe(
    goTo.guild(),
    Effect.tap(() => Effect.log('changing view: arcaneCrystal')),
    Effect.andThen(click({ left: '85%', top: '85%' })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'arcaneCrystal' })),
  ),
  pickaxeSupplies: () => pipe(
    goTo.arcaneCrystal(),
    Effect.tap(() => Effect.log('changing view: pickaxeSupplies')),
    Effect.andThen(click({ left: '90%', top: '3%' })),
    Effect.tap(() => navigation.store.trigger.navigateView({ view: 'pickaxeSupplies' })),
  ),
};

export const goToView = (view: navigation.ViewName) => {
  return goTo[view]();
}
