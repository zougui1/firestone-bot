import { Effect, pipe } from 'effect';
import { z } from 'zod';

import { upgrades, type Upgrade } from './data';
import * as database from '../database';
import * as api from '../api';

// replies when claiming a research
// data: [slotIndex, unknown, unknown]
//* { "Function": "LibraryReplies", "SubFunction": "CompleteFirestoneResearchReply", "Data": [0, 1, false] };
//* { "Function": "LibraryReplies", "SubFunction": "CompleteFirestoneResearchReply", "Data": [1, 1, false] };
//* {"Function":"BuyPremiumProductReplies","SubFunction":"DoFirestoneResearchSpeedUpReply","Data":[0,1,false]}
// replies when starting a research; timestamp is the time at which the research started
//* {"Function":"LibraryReplies","SubFunction":"StartFirestoneResearchReply","Data":[0,24,1746118458]}

interface LocalState {
  slots: [{ isAvailable: boolean; }, { isAvailable: boolean; }];
  upgrades: Record<string, { level: number; }>;
}

const researches = [
  //upgradeMap['trainer skills'],
  //upgradeMap['expeditioner'],
  //upgradeMap['meteorite hunter'],

  //upgradeMap['prestigious'],
  upgrades['raining gold'],
  //upgradeMap['skip stage'],
  //upgradeMap['skip wave'],

  upgrades['damage specialization'],
  upgrades['attribute damage'],
  upgrades['energy heroes'],
  upgrades['precision'],
  upgrades['leadership'],
  upgrades['all main attributes'],

  //upgradeMap['critical loot bonus'],
  //upgradeMap['critical loot chance'],

  upgrades['attribute armor'],
  upgrades['attribute health'],
  upgrades['expose weakness'],
  upgrades['powerless enemy'],
  upgrades['weaklings'],
  upgrades['firestone effect'],
  //upgradeMap['medal of honor'],
  upgrades['powerless boss'],

  upgrades['mana heroes'],
  upgrades['rage heroes'],
  upgrades['fist fight'],
  upgrades['magic spells'],
  upgrades['tank specialization'],
  upgrades['healer specialization'],

  upgrades['guardian power'],
  //upgradeMap['guardian projectiles'],
];

const startFirestoneResearch = (library: database.firestoneLibrary.FirestoneLibraryType, upgrade: Upgrade) => {
  const maxLevel = upgrades.get(upgrade.name)?.maxLevel ?? 60;
  const persistedLevel = library.upgrades[upgrade.name]?.level ?? 0;
  let level = persistedLevel;

  return pipe(
    Effect.retry(
      pipe(
        Effect.gen(function* () {
          yield* Effect.log(`Starting research ${upgrade.name} with current level ${level}`);
        }),
        Effect.flatMap(() => api.firestoneLibrary.startFirestoneResearch({
          tree: library.treeLevel - 1,
          id: upgrade.id,
          currentLevel: level,
        })),
      ),
      {
        until: error => ++level >= maxLevel && '_tag' in error && error._tag === 'TimeoutError',
      },
    ),
    Effect.map(() => ({ started: true, level })),
    Effect.catchTag('TimeoutError', () => pipe(
      Effect.logError(`Requests to start research ${upgrade.name} timed out`),
      Effect.as({
        // if the level wasn't persisted and it hasn't started then it means
        // the upgrade hasn't been unlocked yet
        started: false,
        level: persistedLevel,
      }),
    )),
  );
}

export const handleFirestoneResearch = () => {
  const state: LocalState = {
    slots: [{ isAvailable: false }, { isAvailable: false }],
    upgrades: {},
  };

  const doFirestoneResearchSpeedUp = ({ tree, slot }: { tree: number, slot: number }) => {
    return api.firestoneLibrary.doFirestoneResearchSpeedUp({
      tree,
      slot,
      gems: 0,
    }).pipe(
      Effect.tap(() => state.slots[slot].isAvailable = true),
      Effect.catchTag('TimeoutError', Effect.logError),
    );
  }

  const completeFirestoneResearch = ({ tree, slot }: { tree: number, slot: number }) => {
    // no need to complete a research slot that has already been sped up to completion
    if (state.slots[slot].isAvailable) {
      return Effect.void;
    }

    return api.firestoneLibrary.completeFirestoneResearch({
      tree,
      slot,
    }).pipe(
      Effect.tap(() => state.slots[slot].isAvailable = true),
      Effect.catchTag('TimeoutError', Effect.logError),
    );
  }

  return Effect.gen(function* () {
    const config = yield* database.config.findOne();
    const firestoneLibrary = config.features.firestoneResearch;
    const tree = firestoneLibrary.treeLevel - 1;

    yield* Effect.log('Speeding up firestone researches');
    yield* doFirestoneResearchSpeedUp({ tree, slot: 1 });
    yield* doFirestoneResearchSpeedUp({ tree, slot: 0 });

    yield* Effect.log('Claiming firestone researches');
    yield* completeFirestoneResearch({ tree, slot: 1 });
    yield* completeFirestoneResearch({ tree, slot: 0 });

    const availableSlots = Object.values(state.slots).filter(slot => slot.isAvailable);

    if (availableSlots.length) {
      const library = yield* database.firestoneLibrary.findByTreeLevel(firestoneLibrary.treeLevel);
      yield* Effect.log(`Starting firestone researches: ${availableSlots.length} slots`);

      const upgradesToSkip = new Set<string>();

      for (const slot of availableSlots) {
        const availableResearches = researches.filter(research => {
          const persistedUpgrade = library.upgrades[research.name];
          const upgrade = upgrades.get(research.name);

          if (!upgrade || upgradesToSkip.has(research.name) || research.id < 0) return false;

          return !persistedUpgrade || persistedUpgrade.level < upgrade.maxLevel;
        });

        for (const research of availableResearches) {
          const result = yield* startFirestoneResearch(library, research);
          upgradesToSkip.add(research.name);

          if (result.level) {
            state.upgrades[research.name] = { level: result.level + 1 };
          }

          if (result.started) {
            slot.isAvailable = false;
            break;
          }
        }
      }
    } else {
      yield* Effect.log('No slots available to start firestone researches');
    }

    yield* database.firestoneLibrary
      .updateUpgrades(firestoneLibrary.treeLevel, state.upgrades)
      .pipe(Effect.orElseSucceed(() => undefined));
  }).pipe(
    Effect.withLogSpan('firestoneLibrary'),
    Effect.withSpan('firestoneLibrary'),
  );
}
