import { Console, Effect, pipe } from 'effect';

import { click, press } from '../api';
import { hotkeys } from '../hotkeys';
import { store, ViewName } from '../store';

export const goTo = {
  main: () => pipe(
    Console.log('changing view: main'),
    Effect.as(store.getSnapshot().context),
    Effect.flatMap(({ views }) => {
      return Effect.forEach(views, () => pipe(
        Console.log('changing view: back'),
        Effect.andThen(press({ key: hotkeys.escape })),
        Effect.tap(() => store.trigger.popView()),
      ), { discard: true });
    }),
  ),
  town: () => pipe(
    Console.log('changing view: town'),
    Effect.andThen(() => press({ key: hotkeys.town })),
    Effect.tap(() => store.trigger.navigateView({ view: 'town' })),
  ),
  alchemist: () => pipe(
    Console.log('changing view: alchemist'),
    Effect.andThen(() => press({ key: hotkeys.alchemist })),
    Effect.tap(() => store.trigger.navigateView({ view: 'alchemist' })),
  ),
  oracle: () => pipe(
    Console.log('changing view: oracle'),
    Effect.andThen(() => press({ key: hotkeys.oracle })),
    Effect.tap(() => store.trigger.navigateView({ view: 'oracle' })),
  ),
  guardians: () => pipe(
    Console.log('changing view: guardians'),
    Effect.andThen(() => press({ key: hotkeys.guardians })),
    Effect.tap(() => store.trigger.navigateView({ view: 'guardians' })),
  ),
  library: () => pipe(
    Console.log('changing view: library'),
    Effect.andThen(() => press({ key: hotkeys.library })),
    Effect.tap(() => store.trigger.navigateView({ view: 'library' })),
  ),
  map: () => pipe(
    Console.log('changing view: map'),
    Effect.andThen(() => press({ key: hotkeys.map })),
    // ensures we're in the map missions and not the campaign
    Effect.andThen(click({ left: '96%', top: '45%' })),
    Effect.tap(() => store.trigger.navigateView({ view: 'map' })),
  ),
  engineerNavigation: () => pipe(
    goTo.town(),
    Effect.tap(() => Console.log('changing view: engineerNavigation')),
    // engineer building button
    Effect.andThen(click({ left: '65%', top: '80%' })),
    Effect.tap(() => store.trigger.navigateView({ view: 'engineerNavigation' })),
  ),
  engineer: () => pipe(
    goTo.engineerNavigation(),
    Effect.tap(() => Console.log('changing view: engineer')),
    // engineer panel button
    Effect.andThen(click({ left: '30%', top: '50%' })),
    Effect.tap(() => store.trigger.navigateView({ view: 'engineer' })),
  ),
  campaign: () => pipe(
    Console.log('changing view: campaign'),
    Effect.andThen(() => press({ key: hotkeys.map })),
    Effect.andThen(click({ left: '96%', top: '55%' })),
    Effect.tap(() => store.trigger.navigateView({ view: 'campaign' })),
  ),
  guild: () => pipe(
    Console.log('changing view: guild'),
    Effect.andThen(() => click({ left: '97%', top: '42%' })),
    Effect.tap(() => store.trigger.navigateView({ view: 'guild' })),
  ),
  guildExpeditions: () => pipe(
    goTo.guild(),
    Effect.tap(() => Console.log('changing view: guildExpeditions')),
    Effect.andThen(click({ left: '20%', top: '32%' })),
    Effect.tap(() => store.trigger.navigateView({ view: 'guildExpeditions' })),
  ),
};

export const goToView = (view: ViewName) => {
  return goTo[view]();
}
