import path from 'node:path';

import { config } from 'dotenv';
import envVar from 'env-var';

config({
  path: path.join(__dirname, '../.env'),
});

export const env = {
  role: envVar.get('ROLE').required().asEnum(['server', 'client']),
  postUiInteractionWaitTime: envVar.get('POST_UI_INTERACTION_WAIT_TIME').required().asIntPositive(),

  socket: {
    port: envVar.get('SOCKET.PORT').required().asPortNumber(),
    domain: envVar.get('SOCKET.DOMAIN').required().asString(),
  },
};
