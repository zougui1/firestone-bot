import { Effect, pipe } from 'effect';

import * as api from '../api';

// claim: [unknown, unknown, unknown]
//* {"Function":"GuildMechanismReplies","SubFunction":"ClaimExpeditionReply","Data":[334,530,false]}
// start: [id, unknown, unknown, startTimestamp]
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":["GUEXP020",600,378,1746177471]
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":["GUEXP011",350,221,1746175187]}
// start
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":[221,350,1746175187]}

const largestId = 19;

export const handleGuildExpeditions = () => {
  return Effect.gen(function* () {
    yield* Effect.log('Claiming expedition');
    yield* api.guildExpeditions.claimExpedition().pipe(
      Effect.catchTag('TimeoutError', () => Effect.logError('Request to claim guild expedition timed out')),
    );

    for (let index = 0; index < largestId; index++) {
      const id = `GUEXP${index.toString().padStart(3, '0')}`;

      yield* Effect.log(`Starting expedition id: ${id}`);
      const { started } = yield* api.guildExpeditions.startExpedition({ id }).pipe(
        Effect.as({ started: true }),
        Effect.catchTag('TimeoutError', () => pipe(
          Effect.logError(`Request to start guild expedition ${id} timed out`),
          Effect.as({ started: false }),
        )),
      );

      if (started) {
        break;
      }
    }
  }).pipe(
    Effect.withLogSpan('guildExpedition'),
    Effect.withSpan('guildExpedition'),
  );
}
