import { Effect, pipe } from 'effect';

import { firestoneLibraryStore, FirestoneResearchSlotId } from '../firestone-library.store';
import { upgrades, researches, type Upgrade } from '../firestone-library.data';
import * as database from '../../../database';
import * as api from '../../../api';
import { EventQueue } from '../../../eventQueue';
import { env } from '../../../../env';

// replies when claiming a research
// data: [slotIndex, unknown, unknown]
//* { "Function": "LibraryReplies", "SubFunction": "CompleteFirestoneResearchReply", "Data": [0, 1, false] };
//* { "Function": "LibraryReplies", "SubFunction": "CompleteFirestoneResearchReply", "Data": [1, 1, false] };
//* {"Function":"BuyPremiumProductReplies","SubFunction":"DoFirestoneResearchSpeedUpReply","Data":[0,1,false]}
// replies when starting a research; timestamp is the time at which the research started
//* {"Function":"LibraryReplies","SubFunction":"StartFirestoneResearchReply","Data":[0,24,1746118458]}

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
      Effect.logWarning(`Requests to start research ${upgrade.name} timed out`),
      Effect.as({
        started: false,
        level: persistedLevel,
      }),
    )),
  );
}

export const handleFirestoneResearch = () => {
  const doFirestoneResearchSpeedUp = ({ tree, slot }: { tree: number, slot: FirestoneResearchSlotId }) => {
    return api.firestoneLibrary.doFirestoneResearchSpeedUp({
      tree,
      slot,
      gems: 0,
    }).pipe(
      Effect.tap(() => firestoneLibraryStore.trigger.updateSlot({
        id: slot,
        isAvailable: true,
      })),
      Effect.catchTag('TimeoutError', Effect.logError),
    );
  }

  const completeFirestoneResearch = ({ tree, slot }: { tree: number, slot: FirestoneResearchSlotId }) => {
    const state = firestoneLibraryStore.getSnapshot().context;

    // no need to complete a research slot that has already been sped up to completion
    if (state.slots[slot].isAvailable) {
      return Effect.void;
    }

    return api.firestoneLibrary.completeFirestoneResearch({
      tree,
      slot,
    }).pipe(
      Effect.tap(() => firestoneLibraryStore.trigger.updateSlot({
        id: slot,
        isAvailable: true,
      })),
      Effect.catchTag('TimeoutError', Effect.logError),
    );
  }

  return Effect.gen(function* () {
    const eventQueue = yield* EventQueue;
    const config = yield* database.config.findOne();
    const firestoneLibrary = config.features.firestoneResearch;
    const tree = firestoneLibrary.treeLevel - 1;

    yield* Effect.log('Speeding up firestone researches');
    yield* doFirestoneResearchSpeedUp({ tree, slot: 1 });
    yield* doFirestoneResearchSpeedUp({ tree, slot: 0 });

    yield* Effect.log('Claiming firestone researches');
    yield* completeFirestoneResearch({ tree, slot: 1 });
    yield* completeFirestoneResearch({ tree, slot: 0 });

    let state = firestoneLibraryStore.getSnapshot().context;
    const availableSlots = Object.values(state.slots).filter(slot => slot.isAvailable);

    if (!availableSlots.length) {
      yield* Effect.log('No slots available to start firestone researches');
      yield* eventQueue.add({
        type: 'firestoneResearch',
        timeoutMs: env.firestone.blindTimeoutSeconds * 1000,
      });
      return;
    }

    const library = yield* database.firestoneLibrary.findByTreeLevel(firestoneLibrary.treeLevel);
    const upgradesToSkip = new Set<string>();
    yield* Effect.log(`Starting firestone researches: ${availableSlots.length} slots`);

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

        if (result.started) {
          firestoneLibraryStore.trigger.updateUpgrade({
            name: research.name,
            level: result.level + 1,
          });

          Effect.tap(() => firestoneLibraryStore.trigger.updateSlot({
            id: slot.id,
            isAvailable: false,
          }));
          break;
        }
      }
    }

    state = firestoneLibraryStore.getSnapshot().context;
    yield* database.firestoneLibrary
      .updateUpgrades(firestoneLibrary.treeLevel, state.upgrades)
      .pipe(Effect.orElseSucceed(() => undefined));

    const hasStartedResearch = Object.keys(state.upgrades).length > 0;
    const timeoutSeconds = hasStartedResearch ? (2 * 60 * 60) : env.firestone.blindTimeoutSeconds;
    yield* eventQueue.add({
      type: 'firestoneResearch',
      timeoutMs: timeoutSeconds * 1000,
    });

  }).pipe(
    Effect.withLogSpan('firestoneLibrary'),
    Effect.withSpan('firestoneLibrary'),
    Effect.onExit(() => {
      firestoneLibraryStore.trigger.reset();
      return Effect.void;
    }),
  );
}
