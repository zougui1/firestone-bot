import { MongoClient } from 'mongodb';
import Papr from 'papr';

import { env } from '../../env';

export const papr = new Papr();
let client: MongoClient | undefined;

export const connect = async () => {
  if (client) {
    return;
  }

  client = await MongoClient.connect(env.database.uri);
  papr.initialize(client.db(env.database.databaseName));
  await papr.updateSchemas();
}
