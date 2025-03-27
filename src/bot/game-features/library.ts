import { Console, Effect, pipe, Ref, Context } from 'effect';
import { sort } from 'radash';
import leven from 'fast-levenshtein';

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

const canClaimResearch = ({ index, left, top }: {
  index: number;
  left: `${number}%`;
  top: `${number}%`;
}) => {
  return pipe(
    Console.log('checking research', index),
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
          Console.log('claiming firestone research', index),
          Effect.tap(() => click({
            left,
            top,
          })),
          Effect.map(() => true),
        ),
        onFalse: () => pipe(
          Console.log('cannot claim research', index),
          Effect.map(() => false),
        ),
      },
    )),
  );
}

const findUpgrades = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(pipe(
      ScrollIndexState,
      Effect.flatMap(Ref.get),
      Effect.tap(scrollIndex => Effect.loop(scrollIndex, {
        while: scrollIndex => scrollIndex > 0,
        step: scrollIndex => scrollIndex - 1,
        body: () => pipe(
          Console.log('scrolling back to the left'),
          Effect.tap(() => drag({ left: `${-dragPercentPerScroll}%` })),
        ),
        discard: true,
      })),
    ))),
    Effect.tap(() => Console.log('finding firestone research upgrades')),
    Effect.flatMap(() => ScrollIndexState),
    Effect.flatMap(Ref.get),
    Effect.flatMap(scrollIndex => Effect.iterate(
      { scrollIndex, canScroll: true },
      {
        while: ({ canScroll }) => canScroll,
        body: ({ scrollIndex }) => pipe(
          Console.log(`scroll index: ${scrollIndex}; drag per scroll: ${dragPercentPerScroll}%`),
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
                onTrue: () => Console.log(`upgrade ${text.content} already exists`),
                onFalse: () => pipe(
                  Console.log('found upgrade:', text.content),
                  Effect.tap(() => upgradeMap.set(text.content, {
                    name: text.content,
                    left: text.left,
                    top: text.top,
                    scrollRights: new Array(scrollIndex).fill(`${dragPercentPerScroll}%`),
                  })),
                ),
              }),
              onFalse: () => Console.log('the text is not an upgrade:', text.content),
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
              Console.log('can scroll further'),
              Effect.tap(() => drag({ left: `${dragPercentPerScroll}%` })),
              Effect.as({ canScroll: true, scrollIndex: scrollIndex + 1 }),
            ),
            onFalse: () => pipe(
              Console.log('cannot scroll further'),
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
      onSuccess: () => Console.log('upgrades found:', [...upgradeMap.keys()].join(', ')),
      onFailure: () => {
        upgradeMap.clear();
        return Effect.void;
      },
    }),
    Effect.as(upgradeMap),
    Effect.provideServiceEffect(ScrollIndexState, scrollIndexInitialState),
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
    Effect.addFinalizer(() => Effect.orDie(Effect.loop(lastScrollCount, {
      while: scrollIndex => scrollIndex > 0,
      step: scrollIndex => scrollIndex - 1,
      body: () => pipe(
        Console.log('scrolling back to the left'),
        Effect.tap(() => drag({ left: `${-dragPercentPerScroll}%` })),
      ),
      discard: true,
    }))),
    Effect.tap(() => Effect.forEach(upgrades, upgrade => pipe(
      Console.log('handle upgrade:', upgrade.name),
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
                Console.log('scrolling to the right'),
                Effect.tap(() => drag({ left: dragLeft })),
              );
            },
          });
        }

        if (currentScrolls.length > upgradeScrollCount) {
          if (currentScrolls.length === lastScrollCount && upgradeScrollCount > 0) {
            return pipe(
              Console.log('failsafe: currently on last scroll, scrolling back to start'),
              Effect.tap(() => Effect.loop(currentScrolls.length - upgradeScrollCount, {
                while: scrollCount => scrollCount > 0,
                step: scrollCount => scrollCount - 1,
                body: () => {
                  currentScrolls.pop();
                  return pipe(
                    Console.log('scrolling to the left'),
                    Effect.tap(() => drag({
                      left: `${-dragPercentPerScroll}%`,
                    })),
                  );
                },
              })),
              Effect.tap(() => Console.log('scrolling to upgrade')),
              Effect.tap(() => Effect.loop(upgradeScrollCount, {
                while: scrollCount => scrollCount > 0,
                step: scrollCount => scrollCount - 1,
                body: () => {
                  currentScrolls.pop();
                  return pipe(
                    Console.log('scrolling to the right'),
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
                Console.log('scrolling to the left'),
                Effect.tap(() => drag({
                  left: `${-dragPercentPerScroll}%`,
                })),
              );
            },
          });
        }

        return Effect.void;
      }),
      Effect.tap(() => Console.log('opening dialog for upgrade:', upgrade.name)),
      Effect.tap(() => click({
        left: upgrade.left,
        top: upgrade.top,
      })),
      Effect.tap(() => Console.log('trying to start research for upgrade:', upgrade.name)),
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
    ))),
  ));
}

export const handleFirestoneResearch = () => {
  return Effect.scoped(pipe(
    Effect.addFinalizer(() => Effect.orDie(goTo.main())),
    Effect.andThen(() => goTo.firestoneLibrary()),
    Effect.flatMap(() => Effect.all([
      canClaimResearch({ index: 2, left: '62.5%', top: '88%' }),
      canClaimResearch({ index: 1, left: '28%', top: '88%' }),
    ])),
    Effect.tap(claims => Effect.if(claims.includes(true), {
      onTrue: () => pipe(
        Console.log('can start firestone research'),
        Effect.flatMap(() => upgradeMap.size
          ? Effect.succeed(upgradeMap)
          : findUpgrades()
        ),
        Effect.tap(Console.log),
        Effect.tap(startResearches),
        Effect.tap(() => Console.log('done starting researches')),
      ),
      onFalse: () => Console.log('cannot start a firestone research'),
    })),
  ));
}
