import { Effect, pipe } from 'effect';

import { guildStore } from '../guild.store';
import * as api from '../../../api';
import { EventQueue } from '../../../eventQueue';
import { env } from '../../../../env';

// claim: [unknown, unknown, unknown]
//* {"Function":"GuildMechanismReplies","SubFunction":"ClaimExpeditionReply","Data":[334,530,false]}
// start: [id, unknown, unknown, startTimestamp]
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":["GUEXP020",600,378,1746177471]
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":["GUEXP011",350,221,1746175187]}
//* {"Function":"GuildMechanismReplies","SubFunction":"StartExpeditionReply","Data":[221,350,1746175187]}

const largestId = 19;

export const handleGuildExpeditions = () => {
  return Effect.gen(function* () {
    const eventQueue = yield* EventQueue;

    yield* Effect.log('Claiming expedition');
    yield* api.guild.claimExpedition().pipe(
      Effect.tap(() => guildStore.trigger.updateSlotStatus({ status: 'idle' })),
      Effect.catchTag('TimeoutError', () => pipe(
        Effect.logWarning('Request to claim guild expedition timed out'),
      )),
    );

    const state = guildStore.getSnapshot().context;

    if (state.slot.status === 'running') {
      yield* eventQueue.add({
        type: 'guildExpedition',
        timeoutMs: env.firestone.blindTimeoutSeconds * 1000,
      });
      return;
    }

    for (let index = 0; index < largestId; index++) {
      const id = `GUEXP${index.toString().padStart(3, '0')}`;

      yield* Effect.logDebug(`Trying to start expedition id: ${id}`);
      const startResult = yield* api.guild.startExpedition({ id }).pipe(
        Effect.tap(() => Effect.logDebug(`Started guild expedition ${id}`)),
        Effect.map(result => ({ ...result, done: true }) as const),
        Effect.catchTag('TimeoutError', () => pipe(
          Effect.logWarning(`Request to start guild expedition ${id} timed out`),
          Effect.as({ done: false } as const),
        )),
      );

      if (startResult.done) {
        guildStore.trigger.updateSlotStatus({ status: 'running' });

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
    Effect.withLogSpan('guildExpeditions'),
    Effect.withSpan('guildExpeditions'),
  );
}
