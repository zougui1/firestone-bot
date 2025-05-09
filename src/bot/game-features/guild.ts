import { Effect, pipe } from 'effect';

import * as api from '../api';
import * as eventQueue from '../eventQueue';
import { env } from '../../env';

// claim: [unknown, unknown, unknown]
//* {"Function":"GuildMechanismReplies","SubFunction":"ClaimExpeditionReply","Data":[334,530,false]}
// start: [id, unknown, unknown, startTimestamp]
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":["GUEXP020",600,378,1746177471]
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":["GUEXP011",350,221,1746175187]}
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":[221,350,1746175187]}

const largestId = 19;

export const handleGuildExpeditions = () => {
  return Effect.gen(function* () {
    yield* Effect.log('Claiming expedition');
    const claimResult = yield* api.guild.claimExpedition().pipe(
      Effect.as({ done: true }),
      Effect.catchTag('TimeoutError', () => pipe(
        Effect.logError('Request to claim guild expedition timed out'),
        Effect.as({ done: false }),
      )),
    );

    if (!claimResult.done) {
      yield* eventQueue.add({
        type: 'guildExpedition',
        timeoutMs: env.firestone.blindTimeoutSeconds * 1000,
      });
      return;
    }

    for (let index = 0; index < largestId; index++) {
      const id = `GUEXP${index.toString().padStart(3, '0')}`;

      yield* Effect.log(`Starting expedition id: ${id}`);
      const startResult = yield* api.guild.startExpedition({ id }).pipe(
        Effect.map(result => ({ ...result, done: true }) as const),
        Effect.catchTag('TimeoutError', () => pipe(
          Effect.logError(`Request to start guild expedition ${id} timed out`),
          Effect.as({ done: false } as const),
        )),
      );

      if (startResult.done) {
        yield* eventQueue.add({
          type: 'guildExpedition',
          timeoutMs: startResult.durationMinutes * 60 * 1000,
        });
        return;
      }
    }

    yield* eventQueue.add({
      type: 'guildExpedition',
      timeoutMs: env.firestone.blindTimeoutSeconds * 1000,
    });
  }).pipe(
    Effect.withLogSpan('guildExpedition'),
    Effect.withSpan('guildExpedition'),
  );
}
