import { Effect, pipe } from 'effect';
import { schema, types } from 'papr';

import { papr } from './database';

export const FirestoneLibraryModel = papr.model('firestoneLibraries', schema({
  treeLevel: types.number({ required: true }),
  upgrades: types.objectGeneric(
    types.object({ level: types.number({ required: true }) }),
    undefined,
    { required: true }
  ),
}));

export type FirestoneLibraryType = Omit<typeof FirestoneLibraryModel['schema'], '_id'>;

export const findByTreeLevel = (treeLevel: number) => {
  const defaultLibrary: FirestoneLibraryType = { treeLevel, upgrades: {} };

  return pipe(
    Effect.logDebug(`Querying firestone library level ${treeLevel}`),
    Effect.flatMap(() => Effect.tryPromise({
      try: async () => {
        const library = await FirestoneLibraryModel.findOne({ treeLevel });

        if (!library) {
          await FirestoneLibraryModel.insertOne(defaultLibrary);
        }

        return library ?? defaultLibrary;
      },
      catch: cause => new Error(`Could not find or create the firestone library of level ${treeLevel}`, { cause }),
    })),
    Effect.onError(cause => Effect.logError(`Could not retrieve the firestone library of level ${treeLevel}. Using empty firestone library as fallback`, cause)),
    Effect.orElseSucceed(() => defaultLibrary),
  );
}

export const updateUpgrades = (treeLevel: number, upgrades: Record<string, { level: number; }>) => {
  const update: Record<string, { level: number; }> = {};

  for (const [name, upgrade] of Object.entries(upgrades)) {
    update[`upgrades.${name}`] = upgrade;
  }

  return pipe(
    Effect.logDebug(`Updating firestone library level ${treeLevel} for upgrades ${Object.keys(upgrades).join(', ')}`),
    Effect.flatMap(() => Effect.tryPromise({
      try: async () => {
        await FirestoneLibraryModel.updateOne({ treeLevel }, { $set: update as any });
      },
      catch: cause => new Error(`Could not update the firestone library of level ${treeLevel}`, { cause }),
    })),
  );
}
