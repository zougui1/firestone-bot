import { Effect, pipe, Ref, Context } from 'effect';
import { sort } from 'radash';

import { goTo } from './view';
import { click, drag, findText } from '../api';

const upgradePriorities = [
  'trainer skills',
  // 'gold' and 'raining gold' are the same
  // upgrade but sometimes the OCR reads
  // 'raining' and 'gold' as separate entries
  'raining gold',
  'gold',
  'meteorite hunter',
  'expeditioner',

  'prestigious',
  'skip stage',
  'skip wave',

  'energy heroes',
  'attribute damage',
  'damage specialization',
  'precision',
  'all main attributes',
  'leadership',
  'team bonus',

  'firestone effect',
  'medal of honor',
  'critical loot bonus',
  'critical loot chance',

  'weaklings',
  'expose weakness',
  'powerless enemy',
  'powerless boss',

  'mana heroes',
  'rage heroes',
  'fist fight',
  'magic spells',
  'tank specialization',
  'healer specialization',

  'attribute health',
  'attribute armor',
  'guardian power',
  'guardian projectiles',
];
const upgradeSet = new Set(upgradePriorities);

const dragPercentPerScroll = 70;

class ScrollIndexState extends Context.Tag('ScrollIndexState')<
  ScrollIndexState,
  Ref.Ref<number>
  >() { }
const scrollIndexInitialState = Ref.make(0);

interface Upgrade {
  name: string;
  scrollRights: `${number}%`[];
  left: number;
  top: number;
}

const upgradeMap = new Map<string, Upgrade>();

const claimResearch = ({ index, left, top }: {
  index: number;
  left: `${number}%`;
  top: `${number}%`;
}) => {
  return pipe(
    Effect.log(`Checking research ${index}`),
    Effect.flatMap(() => findText({
      left,
      top,
      width: '6%',
      height: '7%',
    })),
    Effect.flatMap(buttonTexts => Effect.if(
      (
        buttonTexts.some(text => text.content.toLowerCase().includes('claim')) ||
        buttonTexts.some(text => text.content.toLowerCase().includes('free'))
      ),
      {
        onTrue: () => pipe(
          Effect.logDebug(`Claiming firestone research ${index}`),
          Effect.tap(() => click({
            left,
            top,
          })),
          Effect.tap(() => Effect.log(`Claimed research ${index}`)),
          Effect.map(() => true),
        ),
        onFalse: () => pipe(
          Effect.log(`Cannot claim research ${index}`),
          Effect.map(() => false),
        ),
      },
    )),
  );
}

const findUpgrades = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => pipe(
      ScrollIndexState,
      Effect.flatMap(Ref.get),
      Effect.tap(scrollIndex => Effect.loop(scrollIndex, {
        while: scrollIndex => scrollIndex > 0,
        step: scrollIndex => scrollIndex - 1,
        body: () => pipe(
          Effect.logDebug('Scrolling back to the left'),
          Effect.tap(() => drag({ left: `${-dragPercentPerScroll}%` })),
        ),
        discard: true,
      })),
    )),
    Effect.tap(() => Effect.log('Finding firestone research upgrades')),
    Effect.flatMap(() => ScrollIndexState),
    Effect.flatMap(Ref.get),
    Effect.flatMap(scrollIndex => Effect.iterate(
      { scrollIndex, canScroll: true },
      {
        while: ({ canScroll }) => canScroll,
        body: ({ scrollIndex }) => pipe(
          Effect.logDebug(`Scroll index: ${scrollIndex}`),
          // find all upgrades
          Effect.flatMap(() => findText({
            left: 0,
            top: '15%',
            width: '90%',
            height: '65%',
          })),
          Effect.map(texts => texts.map(text => ({
            ...text,
            content: text.content.toLowerCase(),
          }))),
          Effect.tap(texts => Effect.forEach(texts, text => pipe(
            Effect.if(upgradeSet.has(text.content), {
              onTrue: () => Effect.if(upgradeMap.has(text.content), {
                onTrue: () => Effect.logDebug(`Upgrade ${text.content} already exists`),
                onFalse: () => pipe(
                  Effect.logDebug(`Found upgrade: ${text.content}`),
                  Effect.tap(() => upgradeMap.set(text.content, {
                    name: text.content,
                    left: text.left,
                    top: text.top,
                    scrollRights: new Array(scrollIndex).fill(`${dragPercentPerScroll}%`),
                  })),
                ),
              }),
              onFalse: () => Effect.logDebug(`The text is not an upgrade: ${text.content}`),
            }),
          ), { discard: true })),
          // try find the right most upgrades to determine
          // if we can scroll further to find more upgrades
          Effect.flatMap(() => findText({
            left: '70%',
            top: '15%',
            width: '20%',
            height: '65%',
          })),
          Effect.flatMap(rightMostTexts => Effect.if(rightMostTexts.length > 0, {
            onTrue: () => pipe(
              Effect.logDebug('Can scroll further'),
              Effect.tap(() => drag({ left: `${dragPercentPerScroll}%` })),
              Effect.as({ canScroll: true, scrollIndex: scrollIndex + 1 }),
            ),
            onFalse: () => pipe(
              Effect.logDebug('Cannot scroll further'),
              Effect.as({ canScroll: false, scrollIndex }),
            ),
          })),
          Effect.tap(({ scrollIndex }) => pipe(
            ScrollIndexState,
            Effect.tap(state => Ref.update(state, () => scrollIndex)),
          )),
        ),
      },
    )),
    Effect.tapBoth({
      onSuccess: () => Effect.log(`Upgrades found: ${[...upgradeMap.keys()].join(', ')}`),
      onFailure: () => {
        upgradeMap.clear();
        return Effect.void;
      },
    }),
    Effect.as(upgradeMap),
    Effect.provideServiceEffect(ScrollIndexState, scrollIndexInitialState),
    Effect.withSpan('firestoneResearch.findAll'),
    Effect.withLogSpan('firestoneResearch.findAll'),
  ));
}

const startResearches = () => {
  const currentScrolls: `${number}%`[] = [];
  const upgrades = sort(
    [...upgradeMap.values()],
    upgrade => upgradePriorities.indexOf(upgrade.name),
  );
  const lastScrollCount = Math.max(...upgrades.map(u => u.scrollRights.length));

  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.loop(lastScrollCount, {
      while: scrollIndex => scrollIndex > 0,
      step: scrollIndex => scrollIndex - 1,
      body: () => pipe(
        Effect.logDebug('Scrolling back to the left'),
        Effect.tap(() => drag({ left: `${-dragPercentPerScroll}%` })),
      ),
      discard: true,
    })),
    Effect.tap(() => Effect.forEach(upgrades, upgrade => pipe(
      Effect.log(`Handle upgrade: ${upgrade.name}`),
      Effect.tap(() => {
        const upgradeScrollCount = upgrade.scrollRights.length;

        if (currentScrolls.length < upgradeScrollCount) {
          const dragLeft = `${dragPercentPerScroll}%`;

          return Effect.loop(upgradeScrollCount - currentScrolls.length, {
            while: scrollCount => scrollCount > 0,
            step: scrollCount => scrollCount - 1,
            body: () => {
              currentScrolls.push(dragLeft);
              return pipe(
                Effect.logDebug('Scrolling to the right'),
                Effect.tap(() => drag({ left: dragLeft })),
              );
            },
          });
        }

        if (currentScrolls.length > upgradeScrollCount) {
          if (currentScrolls.length === lastScrollCount && upgradeScrollCount > 0) {
            return pipe(
              Effect.logDebug('Failsafe: currently on last scroll, scrolling back to the start'),
              Effect.tap(() => Effect.loop(currentScrolls.length - upgradeScrollCount, {
                while: scrollCount => scrollCount > 0,
                step: scrollCount => scrollCount - 1,
                body: () => {
                  currentScrolls.pop();
                  return pipe(
                    Effect.logDebug('Scrolling to the left'),
                    Effect.tap(() => drag({
                      left: `${-dragPercentPerScroll}%`,
                    })),
                  );
                },
              })),
              Effect.tap(() => Effect.logDebug('Scrolling to upgrade')),
              Effect.tap(() => Effect.loop(upgradeScrollCount, {
                while: scrollCount => scrollCount > 0,
                step: scrollCount => scrollCount - 1,
                body: () => {
                  currentScrolls.pop();
                  return pipe(
                    Effect.logDebug('Scrolling to the right'),
                    Effect.tap(() => drag({
                      left: `${dragPercentPerScroll}%`,
                    })),
                  );
                },
              })),
            );
          }

          return Effect.loop(currentScrolls.length - upgradeScrollCount, {
            while: scrollCount => scrollCount > 0,
            step: scrollCount => scrollCount - 1,
            body: () => {
              currentScrolls.pop();
              return pipe(
                Effect.logDebug('Scrolling to the left'),
                Effect.tap(() => drag({
                  left: `${-dragPercentPerScroll}%`,
                })),
              );
            },
          });
        }

        return Effect.void;
      }),
      Effect.tap(() => Effect.logDebug(`Opening dialog for upgrade: ${upgrade.name}`)),
      Effect.tap(() => click({
        left: upgrade.left,
        top: upgrade.top,
      })),
      Effect.tap(() => Effect.logDebug(`Trying to start research for upgrade: ${upgrade.name}`)),
      Effect.tap(() => click({
        left: '35%',
        top: '75%',
      })),
      // close the dialog saying no researches can be done if it's open
      // otherwise click somewhere with no buttons
      Effect.tap(() => click({ left: 1, top: 1 })),
      // close the upgrade's dialog if it's open
      // otherwise click somewhere with no buttons
      Effect.tap(() => click({ left: 1, top: 1 })),
      Effect.tap(() => Effect.log(`Handled upgrade ${upgrade.name}`)),
      Effect.withSpan(`firestoneResearch.start.${upgrade.name}`),
      Effect.withLogSpan(`firestoneResearch.start.${upgrade.name}`),
    ))),
  ));
}

export const handleFirestoneResearch = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => goTo.main()),
    Effect.tap(() => goTo.firestoneLibrary()),
    Effect.flatMap(() => Effect.all([
      claimResearch({ index: 2, left: '62.5%', top: '88%' }),
      claimResearch({ index: 1, left: '28%', top: '88%' }),
    ])),
    Effect.tap(claims => Effect.if(claims.includes(true), {
      onTrue: () => pipe(
        Effect.log('Can start firestone research'),
        Effect.flatMap(() => upgradeMap.size
          ? Effect.succeed(upgradeMap)
          : findUpgrades()
        ),
        Effect.tap(upgrades => Effect.logDebug('Upgrades', upgrades)),
        Effect.tap(startResearches),
        Effect.tap(() => Effect.log('Done starting researches')),
      ),
      onFalse: () => Effect.log('Cannot start a firestone research'),
    })),
    Effect.withSpan('firestoneResearch'),
    Effect.withLogSpan('firestoneResearch'),
  ));
}
