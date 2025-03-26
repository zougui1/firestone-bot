import { Console, Effect, pipe } from 'effect';
import { schema, types } from 'papr';

import { papr } from './database';
import { guardians } from '../game-features';
import { event } from '../store';
import { defaultConfig } from '../defaultConfig';

export const ConfigModel = papr.model('configs', schema({
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
    }, { required: true }),
    mapMission: types.object({
      enabled: types.boolean({ required: true }),
    }, { required: true }),
  } satisfies Record<event.ActionType, unknown>, { required: true }),
}));

export type ConfigType = Omit<typeof ConfigModel['schema'], '_id'>;

export const findOne = () => {
  return pipe(
    Console.log('finding config'),
    Effect.flatMap(() => Effect.tryPromise({
      try: async () => {
        const config = await ConfigModel.findOne({});
        return config ?? defaultConfig;
      },
      catch: cause => new Error('could not find the config', { cause }),
    })),
    Effect.tapError(cause => Console.log(cause, '\nusing the default config as fallback')),
    Effect.orElseSucceed(() => defaultConfig),
    Effect.tap(config => Console.log('config:', config)),
  );
}
