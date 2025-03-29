import { schema, types } from 'papr';

import { papr } from './database';

export const LogModel = papr.model('logs', schema({
  message: types.unknown(),
  cause: types.string(),
  logLevel: types.string({ required: true }),
  fiberId: types.string({ required: true }),
  date: types.date({ required: true }),
  annotations: types.objectGeneric(types.unknown(), undefined, { required: true }),
  spans: types.objectGeneric(types.number({ required: true }), undefined, { required: true }),
}));

export type LogType = Omit<typeof LogModel['schema'], '_id'>;
