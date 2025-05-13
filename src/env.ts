import path from 'node:path';

import { config } from 'dotenv';
import envVar from 'env-var';

config({
  path: path.join(__dirname, '../.env'),
});

const NODE_ENV = envVar.get('NODE_ENV').default('development').asEnum(['development', 'production']);

export const env = {
  isDev: NODE_ENV === 'development',

  socket: {
    port: envVar.get('SOCKET.PORT').required().asPortNumber(),
    domain: envVar.get('SOCKET.DOMAIN').required().asString(),
  },

  database: {
    uri: envVar.get('DATABASE.URI').required().asString(),
    databaseName: envVar.get('DATABASE.DATABASE_NAME').required().asString(),
  },

  firestone: {
    userId: envVar.get('FIRESTONE.USER_ID').required().asString(),
    server: envVar.get('FIRESTONE.SERVER').required().asString(),
    freeDurationSeconds: 3 * 60,
    cycleDurationSeconds: 6 * 60 * 60,
    blindTimeoutSeconds: 30,

    socket: {
      uri: envVar.get('FIRESTONE.SOCKET.URI').required().asUrlString(),
    },
  },
};
