import { Effect, pipe } from 'effect';
import { schema, types } from 'papr';

import { papr } from './database';
import { guardians } from '../game-features';
import { event } from '../store';
import { defaultConfig } from '../../defaultConfig';

export const ConfigModel = papr.model('configs', schema({
  sessionId: types.string({ required: true }),
  disabled: types.boolean(),
  features: types.object({
    engineerTools: types.object({
      enabled: types.boolean({ required: true }),
    }, { required: true }),
    campaignLoot: types.object({
      enabled: types.boolean({ required: true }),
    }, { required: true }),
    guardianTraining: types.object({
      enabled: types.boolean({ required: true }),
      guardian: types.enum(guardians, { required: true }),
    }, { required: true }),
    firestoneResearch: types.object({
      enabled: types.boolean({ required: true }),
      treeLevel: types.number({ required: true, minimum: 1 }),
    }, { required: true }),
    guildExpedition: types.object({
      enabled: types.boolean({ required: true }),
    }, { required: true }),
    oracleRitual: types.object({
      enabled: types.boolean({ required: true }),
    }, { required: true }),
    pickaxesClaiming: types.object({
      enabled: types.boolean({ required: true }),
    }, { required: true }),
    alchemyExperiment: types.object({
      enabled: types.boolean({ required: true }),
      treeLevel: types.number({ required: true, minimum: 1 }),
      blood: types.boolean({ required: true }),
      dust: types.boolean({ required: true }),
      exoticCoins: types.boolean({ required: true }),
      durationMinutes: types.number({ required: true }),
    }, { required: true }),
    mapMission: types.object({
      enabled: types.boolean({ required: true }),
      squads: types.number({ required: true }),
    }, { required: true }),
  } satisfies Record<event.ActionType, unknown>, { required: true }),
}));

export type ConfigType = Omit<typeof ConfigModel['schema'], '_id'>;

export const findOne = () => {
  return pipe(
    Effect.logDebug('Querying config'),
    Effect.flatMap(() => Effect.tryPromise({
      try: async () => {
        const config = await ConfigModel.findOne({});
        return config ?? defaultConfig;
      },
      catch: cause => new Error('Could not find the config', { cause }),
    })),
    Effect.onError(cause => Effect.logError('Could not retrieve the config. Using the default config as fallback', cause)),
    Effect.orElseSucceed(() => defaultConfig),
    Effect.tap(config => Effect.logDebug('config:', config)),
  );
}
